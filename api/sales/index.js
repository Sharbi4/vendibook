/**
 * Sales API - Main endpoint for sale transactions
 * 
 * GET /api/sales - List sale transactions for current user
 * POST /api/sales - Create a new sale transaction (buyer makes offer)
 */

import { sql, bootstrapSaleTransactionsTable, bootstrapSaleUpsellsTable, bootstrapListingsTable, bootstrapUsersTable, bootstrapMessageThreadsTable } from '../../src/api/db.js';
import { SALES_STATES, canTransition, createStateHistoryEntry, calculateSaleFees } from '../../src/lib/stateMachines/salesStateMachine.js';

async function ensureTablesExist() {
  await bootstrapListingsTable();
  await bootstrapUsersTable();
  await bootstrapMessageThreadsTable();
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

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

/**
 * GET /api/sales
 * List sale transactions for the current user (as buyer or seller)
 */
async function handleGet(req, res) {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    const role = req.query.role; // 'buyer', 'seller', or undefined for both
    const status = req.query.status;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    let whereClause = '';
    const params = [userId];

    if (role === 'buyer') {
      whereClause = 'WHERE st.buyer_user_id = $1';
    } else if (role === 'seller') {
      whereClause = 'WHERE st.seller_user_id = $1';
    } else {
      whereClause = 'WHERE (st.buyer_user_id = $1 OR st.seller_user_id = $1)';
    }

    if (status) {
      whereClause += ` AND st.status = $${params.length + 1}`;
      params.push(status);
    }

    const transactions = await sql`
      SELECT 
        st.*,
        l.title as listing_title,
        l.city as listing_city,
        l.state as listing_state,
        l.display_city,
        l.display_state,
        seller.display_name as seller_name,
        seller.email as seller_email,
        buyer.display_name as buyer_name,
        buyer.email as buyer_email
      FROM sale_transactions st
      JOIN listings l ON l.id = st.listing_id
      JOIN users seller ON seller.id = st.seller_user_id
      JOIN users buyer ON buyer.id = st.buyer_user_id
      WHERE (st.buyer_user_id = ${userId} OR st.seller_user_id = ${userId})
      ${status ? sql`AND st.status = ${status}` : sql``}
      ORDER BY st.created_at DESC;
    `;

    return res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching sale transactions:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch sale transactions' });
  }
}

/**
 * POST /api/sales
 * Create a new sale transaction (buyer makes initial offer/inquiry)
 * This triggers: SaleTransaction created, messaging thread opens, state = UnderOffer
 */
async function handlePost(req, res) {
  try {
    const {
      listingId,
      buyerUserId,
      offerAmount,
      message
    } = req.body;

    // Validation
    if (!listingId) {
      return res.status(400).json({ success: false, error: 'listingId is required' });
    }
    if (!buyerUserId) {
      return res.status(400).json({ success: false, error: 'buyerUserId is required' });
    }

    // Get the listing
    const [listing] = await sql`
      SELECT * FROM listings WHERE id = ${listingId};
    `;

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (listing.listing_type !== 'SALE') {
      return res.status(400).json({ success: false, error: 'This listing is not for sale' });
    }

    if (listing.sale_status === 'Sold') {
      return res.status(400).json({ success: false, error: 'This listing has already been sold' });
    }

    // Get seller user ID
    const sellerUserId = listing.owner_user_id;
    if (!sellerUserId) {
      return res.status(400).json({ success: false, error: 'Listing has no owner assigned' });
    }

    // Prevent buyer from being the seller
    if (buyerUserId === sellerUserId) {
      return res.status(400).json({ success: false, error: 'You cannot buy your own listing' });
    }

    // Check for existing active transaction
    const [existingTransaction] = await sql`
      SELECT id, status FROM sale_transactions 
      WHERE listing_id = ${listingId} 
      AND buyer_user_id = ${buyerUserId}
      AND status NOT IN ('Completed', 'Canceled');
    `;

    if (existingTransaction) {
      return res.status(409).json({ 
        success: false, 
        error: 'You already have an active transaction for this listing',
        transactionId: existingTransaction.id
      });
    }

    // Calculate initial offer (use asking price if no offer provided)
    const askingPrice = Number(listing.price);
    const initialOffer = offerAmount ? Number(offerAmount) : askingPrice;

    // Create messaging thread for buyer-seller communication
    const [messageThread] = await sql`
      INSERT INTO message_threads (
        host_user_id,
        renter_user_id,
        last_message_preview,
        created_at,
        updated_at
      ) VALUES (
        ${sellerUserId},
        ${buyerUserId},
        ${message ? message.substring(0, 100) : 'New offer on your listing'},
        NOW(),
        NOW()
      )
      RETURNING id;
    `;

    // Create initial state history entry
    const stateHistory = [createStateHistoryEntry(SALES_STATES.UNDER_OFFER, 'Buyer submitted initial offer')];

    // Create the sale transaction
    const [transaction] = await sql`
      INSERT INTO sale_transactions (
        listing_id,
        seller_user_id,
        buyer_user_id,
        message_thread_id,
        asking_price,
        offer_amount,
        status,
        state_history,
        created_at,
        updated_at
      ) VALUES (
        ${listingId},
        ${sellerUserId},
        ${buyerUserId},
        ${messageThread.id},
        ${askingPrice},
        ${initialOffer},
        ${SALES_STATES.UNDER_OFFER},
        ${JSON.stringify(stateHistory)},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    // If buyer included a message, add it to the thread
    if (message) {
      await sql`
        INSERT INTO messages (
          thread_id,
          sender_user_id,
          body,
          message_type,
          created_at,
          updated_at
        ) VALUES (
          ${messageThread.id},
          ${buyerUserId},
          ${message},
          'text',
          NOW(),
          NOW()
        );
      `;

      // Update thread unread count for seller
      await sql`
        UPDATE message_threads 
        SET host_unread_count = host_unread_count + 1,
            last_message_at = NOW(),
            last_message_preview = ${message.substring(0, 100)}
        WHERE id = ${messageThread.id};
      `;
    }

    // Create notification for seller
    await sql`
      INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        thread_id,
        created_at,
        updated_at
      ) VALUES (
        ${sellerUserId},
        'sale_offer_received',
        'New Offer Received',
        ${'You have received an offer of $' + initialOffer.toLocaleString() + ' on your listing "' + listing.title + '"'},
        ${messageThread.id},
        NOW(),
        NOW()
      );
    `;

    return res.status(201).json({
      success: true,
      data: {
        transaction,
        messageThreadId: messageThread.id
      },
      message: 'Offer submitted successfully. Messaging thread opened with seller.'
    });
  } catch (error) {
    console.error('Error creating sale transaction:', error);
    return res.status(500).json({ success: false, error: 'Failed to create sale transaction' });
  }
}
