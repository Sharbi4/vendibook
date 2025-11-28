/**
 * Sales API - Individual transaction endpoint
 * 
 * GET /api/sales/[id] - Get transaction details
 * PATCH /api/sales/[id] - Update transaction (state changes, confirmations)
 */

import { sql, bootstrapSaleTransactionsTable, bootstrapSaleUpsellsTable, bootstrapListingsTable } from '../../../src/api/db.js';
import { 
  SALES_STATES, 
  canTransition, 
  validateTransition,
  createStateHistoryEntry, 
  calculateSaleFees,
  shouldMaskAddress,
  canSendMessages
} from '../../../src/lib/stateMachines/salesStateMachine.js';

async function ensureTablesExist() {
  await bootstrapListingsTable();
  await bootstrapSaleTransactionsTable();
  await bootstrapSaleUpsellsTable();
}

export default async function handler(req, res) {
  try {
    await ensureTablesExist();
  } catch (error) {
    console.error('Failed to bootstrap sales tables:', error);
    return res.status(500).json({ success: false, error: 'Database initialization failed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Transaction ID is required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

/**
 * GET /api/sales/[id]
 * Get full transaction details including upsells
 */
async function handleGet(req, res, transactionId) {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];

    const [transaction] = await sql`
      SELECT 
        st.*,
        l.title as listing_title,
        l.description as listing_description,
        l.city as listing_city,
        l.state as listing_state,
        l.display_city,
        l.display_state,
        l.full_street_address,
        l.postal_code,
        l.latitude,
        l.longitude,
        l.year,
        l.make,
        l.model,
        l.vin_number,
        l.mileage,
        l.hours,
        l.item_condition,
        l.video_url,
        l.title_verified,
        l.inspection_available,
        l.shipping_available,
        l.delivery_available,
        seller.display_name as seller_name,
        seller.email as seller_email,
        seller.phone as seller_phone,
        buyer.display_name as buyer_name,
        buyer.email as buyer_email,
        buyer.phone as buyer_phone
      FROM sale_transactions st
      JOIN listings l ON l.id = st.listing_id
      JOIN users seller ON seller.id = st.seller_user_id
      JOIN users buyer ON buyer.id = st.buyer_user_id
      WHERE st.id = ${transactionId};
    `;

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Check authorization - must be buyer or seller
    if (userId && transaction.buyer_user_id !== userId && transaction.seller_user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this transaction' });
    }

    // Get attached upsells
    const upsells = await sql`
      SELECT * FROM sale_upsells 
      WHERE sale_transaction_id = ${transactionId}
      ORDER BY created_at;
    `;

    // Apply address masking based on state
    const addressMasked = shouldMaskAddress(transaction.status);
    
    const response = {
      ...transaction,
      upsells,
      permissions: {
        addressMasked,
        messagingEnabled: canSendMessages(transaction.status),
        canConfirmReceipt: transaction.status === SALES_STATES.PAID || transaction.status === SALES_STATES.IN_TRANSFER,
        isCompleted: transaction.status === SALES_STATES.COMPLETED,
        isCanceled: transaction.status === SALES_STATES.CANCELED
      }
    };

    // Mask address if not yet paid
    if (addressMasked) {
      response.full_street_address = null;
      response.postal_code = null;
      response.latitude = null;
      response.longitude = null;
      response.seller_phone = null;
    }

    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching sale transaction:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch transaction' });
  }
}

/**
 * PATCH /api/sales/[id]
 * Update transaction state or details
 * 
 * Actions:
 * - action: 'accept_offer' (seller accepts, moves to OfferAccepted)
 * - action: 'decline_offer' (seller declines, moves to Canceled)
 * - action: 'update_offer' (buyer/seller adjusts offer amount)
 * - action: 'initiate_payment' (buyer starts payment, moves to PaymentPending)
 * - action: 'confirm_payment' (system confirms payment, moves to Paid)
 * - action: 'start_transfer' (moves to InTransfer)
 * - action: 'buyer_confirm' (buyer confirms receipt)
 * - action: 'seller_confirm' (seller confirms transfer)
 * - action: 'complete' (finalize transaction)
 * - action: 'cancel' (cancel transaction)
 */
async function handlePatch(req, res, transactionId) {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || req.body.userId;
    const { action, ...data } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, error: 'action is required' });
    }

    // Get current transaction
    const [transaction] = await sql`
      SELECT st.*, l.title as listing_title, l.price as listing_price
      FROM sale_transactions st
      JOIN listings l ON l.id = st.listing_id
      WHERE st.id = ${transactionId};
    `;

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const isBuyer = userId === transaction.buyer_user_id;
    const isSeller = userId === transaction.seller_user_id;
    const isAdmin = req.headers['x-admin'] === 'true';

    // Process action
    switch (action) {
      case 'accept_offer':
        return handleAcceptOffer(req, res, transaction, isSeller, data);
      
      case 'decline_offer':
        return handleDeclineOffer(req, res, transaction, isSeller, data);
      
      case 'update_offer':
        return handleUpdateOffer(req, res, transaction, isBuyer, isSeller, data);
      
      case 'initiate_payment':
        return handleInitiatePayment(req, res, transaction, isBuyer, data);
      
      case 'confirm_payment':
        return handleConfirmPayment(req, res, transaction, data);
      
      case 'start_transfer':
        return handleStartTransfer(req, res, transaction, isSeller, data);
      
      case 'buyer_confirm':
        return handleBuyerConfirm(req, res, transaction, isBuyer, data);
      
      case 'seller_confirm':
        return handleSellerConfirm(req, res, transaction, isSeller, data);
      
      case 'complete':
        return handleComplete(req, res, transaction, isAdmin, data);
      
      case 'cancel':
        return handleCancel(req, res, transaction, isBuyer, isSeller, isAdmin, data);
      
      default:
        return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('Error updating sale transaction:', error);
    return res.status(500).json({ success: false, error: 'Failed to update transaction' });
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleAcceptOffer(req, res, transaction, isSeller, data) {
  if (!isSeller) {
    return res.status(403).json({ success: false, error: 'Only the seller can accept offers' });
  }

  if (!canTransition(transaction.status, SALES_STATES.OFFER_ACCEPTED)) {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot accept offer from status: ${transaction.status}` 
    });
  }

  const finalPrice = data.finalPrice || transaction.offer_amount || transaction.asking_price;
  const fees = calculateSaleFees(Number(finalPrice));

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.OFFER_ACCEPTED, 'Seller accepted the offer')
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      status = ${SALES_STATES.OFFER_ACCEPTED},
      final_price = ${finalPrice},
      seller_commission_amount = ${fees.sellerCommission},
      seller_payout_amount = ${fees.sellerPayout},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Notify buyer
  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES (
      ${transaction.buyer_user_id},
      'sale_offer_accepted',
      'Offer Accepted!',
      ${'Your offer of $' + Number(finalPrice).toLocaleString() + ' for "' + transaction.listing_title + '" has been accepted. Proceed to payment.'},
      ${transaction.message_thread_id},
      NOW(), NOW()
    );
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Offer accepted. Awaiting buyer payment.',
    fees
  });
}

async function handleDeclineOffer(req, res, transaction, isSeller, data) {
  if (!isSeller) {
    return res.status(403).json({ success: false, error: 'Only the seller can decline offers' });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.CANCELED, data.reason || 'Seller declined the offer')
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      status = ${SALES_STATES.CANCELED},
      canceled_at = NOW(),
      canceled_by = 'seller',
      cancellation_reason = ${data.reason || 'Offer declined by seller'},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Notify buyer
  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES (
      ${transaction.buyer_user_id},
      'sale_offer_declined',
      'Offer Declined',
      ${'Unfortunately, your offer for "' + transaction.listing_title + '" was declined.'},
      ${transaction.message_thread_id},
      NOW(), NOW()
    );
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Offer declined.'
  });
}

async function handleUpdateOffer(req, res, transaction, isBuyer, isSeller, data) {
  if (!isBuyer && !isSeller) {
    return res.status(403).json({ success: false, error: 'Only buyer or seller can update offers' });
  }

  if (transaction.status !== SALES_STATES.UNDER_OFFER) {
    return res.status(400).json({ 
      success: false, 
      error: 'Can only update offer amount in UnderOffer state' 
    });
  }

  const newAmount = Number(data.offerAmount);
  if (!newAmount || newAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid offer amount' });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.UNDER_OFFER, 
      isBuyer ? `Buyer updated offer to $${newAmount}` : `Seller counter-offered $${newAmount}`
    )
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      offer_amount = ${newAmount},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Notify the other party
  const notifyUserId = isBuyer ? transaction.seller_user_id : transaction.buyer_user_id;
  const notifyTitle = isBuyer ? 'Offer Updated' : 'Counter Offer Received';
  const notifyBody = isBuyer 
    ? `Buyer updated their offer to $${newAmount.toLocaleString()}`
    : `Seller counter-offered $${newAmount.toLocaleString()}`;

  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES (${notifyUserId}, 'sale_offer_updated', ${notifyTitle}, ${notifyBody}, ${transaction.message_thread_id}, NOW(), NOW());
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Offer updated.'
  });
}

async function handleInitiatePayment(req, res, transaction, isBuyer, data) {
  if (!isBuyer) {
    return res.status(403).json({ success: false, error: 'Only the buyer can initiate payment' });
  }

  if (!canTransition(transaction.status, SALES_STATES.PAYMENT_PENDING)) {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot initiate payment from status: ${transaction.status}` 
    });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.PAYMENT_PENDING, 'Buyer initiated payment')
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      status = ${SALES_STATES.PAYMENT_PENDING},
      payment_method = ${data.paymentMethod || null},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Payment initiated. Complete payment to proceed.'
  });
}

async function handleConfirmPayment(req, res, transaction, data) {
  // This would typically be called by Stripe webhook or internal system
  if (!canTransition(transaction.status, SALES_STATES.PAID)) {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot confirm payment from status: ${transaction.status}` 
    });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.PAID, 'Payment confirmed, funds held in escrow')
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      status = ${SALES_STATES.PAID},
      payment_confirmed_at = NOW(),
      payment_intent_id = ${data.paymentIntentId || null},
      escrow_held_at = NOW(),
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Notify both parties
  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES 
      (${transaction.seller_user_id}, 'sale_payment_received', 'Payment Received!', 
       ${'Buyer has paid for "' + transaction.listing_title + '". Funds are held in escrow. Coordinate pickup/delivery.'}, 
       ${transaction.message_thread_id}, NOW(), NOW()),
      (${transaction.buyer_user_id}, 'sale_payment_confirmed', 'Payment Confirmed!', 
       ${'Your payment for "' + transaction.listing_title + '" is confirmed. Full address and pickup details are now available.'}, 
       ${transaction.message_thread_id}, NOW(), NOW());
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Payment confirmed. Funds held in escrow. Full address revealed to buyer.'
  });
}

async function handleStartTransfer(req, res, transaction, isSeller, data) {
  if (!isSeller) {
    return res.status(403).json({ success: false, error: 'Only the seller can start transfer' });
  }

  if (!canTransition(transaction.status, SALES_STATES.IN_TRANSFER)) {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot start transfer from status: ${transaction.status}` 
    });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.IN_TRANSFER, data.notes || 'Transfer/shipping process started')
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      status = ${SALES_STATES.IN_TRANSFER},
      transfer_method = ${data.transferMethod || 'pickup'},
      shipping_tracking_number = ${data.trackingNumber || null},
      shipping_carrier = ${data.carrier || null},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Transfer process started.'
  });
}

async function handleBuyerConfirm(req, res, transaction, isBuyer, data) {
  if (!isBuyer) {
    return res.status(403).json({ success: false, error: 'Only the buyer can confirm receipt' });
  }

  const validStates = [SALES_STATES.PAID, SALES_STATES.IN_TRANSFER];
  if (!validStates.includes(transaction.status)) {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot confirm receipt from status: ${transaction.status}` 
    });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(transaction.status, 'Buyer confirmed receipt and acceptance')
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      buyer_confirmed_at = NOW(),
      buyer_confirmed_notes = ${data.notes || 'Received and accepted'},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Check if both have confirmed
  if (updated.seller_confirmed_at) {
    return handleComplete(req, res, updated, true, { autoComplete: true });
  }

  // Notify seller
  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES (${transaction.seller_user_id}, 'sale_buyer_confirmed', 'Buyer Confirmed Receipt', 
      ${'Buyer has confirmed receipt of "' + transaction.listing_title + '". Please confirm transfer is complete.'},
      ${transaction.message_thread_id}, NOW(), NOW());
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Receipt confirmed. Waiting for seller to confirm transfer.'
  });
}

async function handleSellerConfirm(req, res, transaction, isSeller, data) {
  if (!isSeller) {
    return res.status(403).json({ success: false, error: 'Only the seller can confirm transfer' });
  }

  const validStates = [SALES_STATES.PAID, SALES_STATES.IN_TRANSFER];
  if (!validStates.includes(transaction.status)) {
    return res.status(400).json({ 
      success: false, 
      error: `Cannot confirm transfer from status: ${transaction.status}` 
    });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(transaction.status, 'Seller confirmed title and possession transferred')
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      seller_confirmed_at = NOW(),
      seller_confirmed_notes = ${data.notes || 'Title and possession transferred'},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Check if both have confirmed
  if (updated.buyer_confirmed_at) {
    return handleComplete(req, res, updated, true, { autoComplete: true });
  }

  // Notify buyer
  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES (${transaction.buyer_user_id}, 'sale_seller_confirmed', 'Seller Confirmed Transfer', 
      ${'Seller has confirmed transfer of "' + transaction.listing_title + '". Please confirm you have received the item.'},
      ${transaction.message_thread_id}, NOW(), NOW());
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Transfer confirmed. Waiting for buyer to confirm receipt.'
  });
}

async function handleComplete(req, res, transaction, isAdmin, data) {
  // Auto-complete when both parties confirm, or admin can force complete
  const bothConfirmed = transaction.buyer_confirmed_at && transaction.seller_confirmed_at;
  
  if (!bothConfirmed && !isAdmin) {
    return res.status(400).json({ 
      success: false, 
      error: 'Both buyer and seller must confirm before completing, or admin must intervene' 
    });
  }

  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.COMPLETED, 
      data.autoComplete ? 'Auto-completed after both parties confirmed' : 'Manually completed by admin'
    )
  ];

  // Calculate final fees
  const finalPrice = Number(transaction.final_price || transaction.offer_amount || transaction.asking_price);
  const fees = calculateSaleFees(finalPrice);

  const [updated] = await sql`
    UPDATE sale_transactions SET
      status = ${SALES_STATES.COMPLETED},
      final_price = ${finalPrice},
      seller_commission_amount = ${fees.sellerCommission},
      seller_payout_amount = ${fees.sellerPayout},
      escrow_released_at = NOW(),
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Update listing status to Sold
  await sql`
    UPDATE listings SET
      sale_status = 'Sold',
      updated_at = NOW()
    WHERE id = ${transaction.listing_id};
  `;

  // Notify both parties
  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES 
      (${transaction.seller_user_id}, 'sale_completed', 'Sale Completed!', 
       ${'Sale of "' + transaction.listing_title + '" is complete. Payout of $' + fees.sellerPayout.toLocaleString() + ' will be processed.'},
       ${transaction.message_thread_id}, NOW(), NOW()),
      (${transaction.buyer_user_id}, 'sale_completed', 'Purchase Complete!', 
       ${'Your purchase of "' + transaction.listing_title + '" is complete. Enjoy your new equipment!'},
       ${transaction.message_thread_id}, NOW(), NOW());
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Sale completed! Payout released to seller.',
    fees
  });
}

async function handleCancel(req, res, transaction, isBuyer, isSeller, isAdmin, data) {
  // Can cancel from most states except Completed
  if (transaction.status === SALES_STATES.COMPLETED) {
    return res.status(400).json({ success: false, error: 'Cannot cancel a completed transaction' });
  }

  // After Paid, only admin can cancel (to handle refunds)
  if (transaction.status === SALES_STATES.PAID && !isAdmin) {
    return res.status(400).json({ 
      success: false, 
      error: 'After payment, only admin can cancel. Contact support for refund.' 
    });
  }

  const canceledBy = isAdmin ? 'admin' : (isBuyer ? 'buyer' : 'seller');
  const stateHistory = [...(transaction.state_history || []), 
    createStateHistoryEntry(SALES_STATES.CANCELED, data.reason || `Canceled by ${canceledBy}`)
  ];

  const [updated] = await sql`
    UPDATE sale_transactions SET
      status = ${SALES_STATES.CANCELED},
      canceled_at = NOW(),
      canceled_by = ${canceledBy},
      cancellation_reason = ${data.reason || 'Transaction canceled'},
      state_history = ${JSON.stringify(stateHistory)},
      updated_at = NOW()
    WHERE id = ${transaction.id}
    RETURNING *;
  `;

  // Notify the other party
  const notifyUserId = isBuyer ? transaction.seller_user_id : transaction.buyer_user_id;
  await sql`
    INSERT INTO notifications (user_id, type, title, body, thread_id, created_at, updated_at)
    VALUES (${notifyUserId}, 'sale_canceled', 'Transaction Canceled', 
      ${'The transaction for "' + transaction.listing_title + '" has been canceled.'},
      ${transaction.message_thread_id}, NOW(), NOW());
  `;

  return res.status(200).json({
    success: true,
    data: updated,
    message: 'Transaction canceled.'
  });
}
