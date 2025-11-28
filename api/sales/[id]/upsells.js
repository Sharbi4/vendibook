/**
 * Sales Upsells API
 * 
 * GET /api/sales/[id]/upsells - Get upsells for a transaction
 * POST /api/sales/[id]/upsells - Add upsell to a transaction
 */

import { sql, bootstrapSaleUpsellsTable, bootstrapSaleTransactionsTable } from '../../../src/api/db.js';
import { SALE_UPSELLS, SALES_STATES } from '../../../src/lib/stateMachines/salesStateMachine.js';

// Available upsell catalog
const UPSELL_CATALOG = {
  [SALE_UPSELLS.INSPECTION]: {
    name: 'Third-Party Inspection',
    description: 'Professional mechanical and safety inspection by certified technician',
    defaultPrice: 350,
  },
  [SALE_UPSELLS.SHIPPING]: {
    name: 'Shipping & Freight',
    description: 'Nationwide shipping with tracking and insurance',
    defaultPrice: 0, // Calculated based on distance
    requiresQuote: true,
  },
  [SALE_UPSELLS.NOTARY]: {
    name: 'Remote Notary Service',
    description: 'Secure title transfer via Proof remote notary',
    defaultPrice: 75,
  },
  [SALE_UPSELLS.TITLE_VERIFICATION]: {
    name: 'Title Verification',
    description: 'Verify clean title with no liens or encumbrances',
    defaultPrice: 50,
  },
  [SALE_UPSELLS.BRANDING_KIT]: {
    name: 'Temporary Branding Kit',
    description: 'Removable vinyl wrap covering previous branding during transition',
    defaultPrice: 200,
  },
};

async function ensureTablesExist() {
  await bootstrapSaleTransactionsTable();
  await bootstrapSaleUpsellsTable();
}

export default async function handler(req, res) {
  try {
    await ensureTablesExist();
  } catch (error) {
    console.error('Failed to bootstrap upsells tables:', error);
    return res.status(500).json({ success: false, error: 'Database initialization failed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Transaction ID is required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }

  if (req.method === 'POST') {
    return handlePost(req, res, id);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

/**
 * GET /api/sales/[id]/upsells
 * Get all upsells for a transaction + available catalog
 */
async function handleGet(req, res, transactionId) {
  try {
    // Verify transaction exists
    const [transaction] = await sql`
      SELECT id, status FROM sale_transactions WHERE id = ${transactionId};
    `;

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Get attached upsells
    const attachedUpsells = await sql`
      SELECT * FROM sale_upsells 
      WHERE sale_transaction_id = ${transactionId}
      ORDER BY created_at;
    `;

    // Calculate total upsell cost
    const totalUpsellCost = attachedUpsells.reduce((sum, u) => sum + Number(u.price), 0);

    return res.status(200).json({
      success: true,
      data: {
        attached: attachedUpsells,
        totalCost: totalUpsellCost,
        catalog: UPSELL_CATALOG,
        canAddUpsells: [SALES_STATES.UNDER_OFFER, SALES_STATES.OFFER_ACCEPTED].includes(transaction.status)
      }
    });
  } catch (error) {
    console.error('Error fetching upsells:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch upsells' });
  }
}

/**
 * POST /api/sales/[id]/upsells
 * Add an upsell to the transaction
 */
async function handlePost(req, res, transactionId) {
  try {
    const {
      upsellType,
      customName,
      customDescription,
      price
    } = req.body;

    // Validate upsell type
    if (!upsellType || !Object.values(SALE_UPSELLS).includes(upsellType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid upsell type. Valid types: ' + Object.values(SALE_UPSELLS).join(', ')
      });
    }

    // Verify transaction exists and is in valid state
    const [transaction] = await sql`
      SELECT id, status FROM sale_transactions WHERE id = ${transactionId};
    `;

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Can only add upsells before payment
    if (![SALES_STATES.UNDER_OFFER, SALES_STATES.OFFER_ACCEPTED].includes(transaction.status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Upsells can only be added before payment is initiated' 
      });
    }

    // Check if this upsell type already exists
    const [existingUpsell] = await sql`
      SELECT id FROM sale_upsells 
      WHERE sale_transaction_id = ${transactionId} 
      AND upsell_type = ${upsellType};
    `;

    if (existingUpsell) {
      return res.status(409).json({ 
        success: false, 
        error: 'This upsell type is already attached to the transaction' 
      });
    }

    // Get catalog info
    const catalogItem = UPSELL_CATALOG[upsellType];
    const upsellName = customName || catalogItem.name;
    const upsellDescription = customDescription || catalogItem.description;
    const upsellPrice = price !== undefined ? Number(price) : catalogItem.defaultPrice;

    // Create upsell
    const [upsell] = await sql`
      INSERT INTO sale_upsells (
        sale_transaction_id,
        upsell_type,
        name,
        description,
        price,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${transactionId},
        ${upsellType},
        ${upsellName},
        ${upsellDescription},
        ${upsellPrice},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    return res.status(201).json({
      success: true,
      data: upsell,
      message: `${upsellName} added to transaction`
    });
  } catch (error) {
    console.error('Error adding upsell:', error);
    return res.status(500).json({ success: false, error: 'Failed to add upsell' });
  }
}

/**
 * DELETE /api/sales/[id]/upsells?upsellId=xxx
 * Remove an upsell from the transaction
 */
async function handleDelete(req, res, transactionId) {
  try {
    const { upsellId } = req.query;

    if (!upsellId) {
      return res.status(400).json({ success: false, error: 'upsellId is required' });
    }

    // Verify transaction exists and is in valid state
    const [transaction] = await sql`
      SELECT id, status FROM sale_transactions WHERE id = ${transactionId};
    `;

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Can only remove upsells before payment
    if (![SALES_STATES.UNDER_OFFER, SALES_STATES.OFFER_ACCEPTED].includes(transaction.status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Upsells can only be removed before payment is initiated' 
      });
    }

    // Delete the upsell
    const result = await sql`
      DELETE FROM sale_upsells 
      WHERE id = ${upsellId} AND sale_transaction_id = ${transactionId}
      RETURNING id, name;
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Upsell not found' });
    }

    return res.status(200).json({
      success: true,
      message: `${result[0].name} removed from transaction`
    });
  } catch (error) {
    console.error('Error removing upsell:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove upsell' });
  }
}
