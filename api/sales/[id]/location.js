/**
 * Sales Location Reveal API
 * 
 * GET /api/sales/[id]/location - Get address for a paid transaction
 * 
 * Per the sales spec:
 * - Address is MASKED until transaction reaches Paid state
 * - Only buyer and seller of the transaction can see the address
 * - Once Paid, full address is revealed for pickup/delivery coordination
 */

import { sql, bootstrapSaleTransactionsTable } from '../../../src/api/db.js';
import { shouldMaskAddress, SALES_STATES } from '../../../src/lib/stateMachines/salesStateMachine.js';

async function ensureTablesExist() {
  await bootstrapSaleTransactionsTable();
}

export default async function handler(req, res) {
  try {
    await ensureTablesExist();
  } catch (error) {
    console.error('Failed to bootstrap tables:', error);
    return res.status(500).json({ success: false, error: 'Database initialization failed' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Transaction ID is required' });
  }

  // Get user from auth (in production, validate JWT)
  const authHeader = req.headers.authorization;
  let userId = null;
  
  if (authHeader) {
    try {
      // Simple token parsing - in production use proper JWT validation
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub || payload.userId || payload.id;
    } catch (e) {
      console.warn('Could not parse auth token:', e.message);
    }
  }

  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required to access location details' 
    });
  }

  try {
    // Get transaction with listing details
    const [transaction] = await sql`
      SELECT 
        st.id,
        st.buyer_user_id,
        st.seller_user_id,
        st.status,
        l.id as listing_id,
        l.title as listing_title,
        l.address,
        l.city,
        l.state,
        l.zip_code,
        l.latitude,
        l.longitude
      FROM sale_transactions st
      JOIN listings l ON l.id = st.listing_id
      WHERE st.id = ${id};
    `;

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Verify user is party to this transaction
    const isBuyer = String(transaction.buyer_user_id) === String(userId);
    const isSeller = String(transaction.seller_user_id) === String(userId);

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ 
        success: false, 
        error: 'You are not authorized to view this transaction\'s location' 
      });
    }

    // Check if address should be masked based on current state
    const maskAddress = shouldMaskAddress(transaction.status);

    if (maskAddress) {
      // Return masked location (city/state only)
      return res.status(200).json({
        success: true,
        data: {
          isMasked: true,
          status: transaction.status,
          city: transaction.city,
          state: transaction.state,
          message: getLocationMessage(transaction.status),
          // Approximate location for map (city center)
          approximateLocation: {
            city: transaction.city,
            state: transaction.state
          }
        }
      });
    }

    // Transaction is Paid or beyond - reveal full address
    return res.status(200).json({
      success: true,
      data: {
        isMasked: false,
        status: transaction.status,
        listingTitle: transaction.listing_title,
        fullAddress: {
          address: transaction.address,
          city: transaction.city,
          state: transaction.state,
          zipCode: transaction.zip_code
        },
        coordinates: {
          latitude: transaction.latitude,
          longitude: transaction.longitude
        },
        formattedAddress: formatAddress(transaction),
        message: 'Full address revealed. Coordinate pickup/delivery in messaging.'
      }
    });

  } catch (error) {
    console.error('Error fetching location:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch location' });
  }
}

/**
 * Get message explaining why location is masked
 */
function getLocationMessage(status) {
  switch (status) {
    case SALES_STATES.UNDER_OFFER:
      return 'Location will be revealed once offer is accepted and payment is completed.';
    case SALES_STATES.OFFER_ACCEPTED:
      return 'Location will be revealed once payment is completed.';
    case SALES_STATES.PAYMENT_PENDING:
      return 'Location will be revealed once payment is confirmed.';
    default:
      return 'Location is currently masked for security.';
  }
}

/**
 * Format full address into readable string
 */
function formatAddress(transaction) {
  const parts = [];
  if (transaction.address) parts.push(transaction.address);
  if (transaction.city) parts.push(transaction.city);
  if (transaction.state) parts.push(transaction.state);
  if (transaction.zip_code) parts.push(transaction.zip_code);
  return parts.join(', ');
}
