// Central UID helper for Vendibook domain entities
// Uses nanoid for compact collision-resistant IDs.
// All create operations should call these helpers instead of ad-hoc concatenation.

import { nanoid } from 'nanoid';

// Prefix registry (kept flat for easy search/extension)
export const UID_PREFIX = {
  // RENT domain
  RENT_TRUCK: 'rent_truck_',
  RENT_TRAILER: 'rent_trailer_',
  RENT_CART: 'rent_cart_',
  RENT_KITCHEN: 'rent_kitchen_',
  RENT_LOT: 'rent_lot_',
  RENT_BOOKING: 'bkg_',
  RENT_BUNDLE_BOOKING: 'bundle_',
  RENT_CANCELLATION: 'cancel_',
  RENT_TRANSACTION: 'txn_rent_',
  RENT_PAYOUT: 'pyt_rent_',
  RENT_DELIVERY_JOB: 'del_job_rent_',

  // SALE domain
  SALE_TRUCK: 'sale_truck_',
  SALE_TRAILER: 'sale_trailer_',
  SALE_CART: 'sale_cart_',
  SALE_INQUIRY: 'inq_sale_',
  SALE_TRANSACTION: 'txn_sale_',
  SALE_TITLE_DOC: 'doc_title_',
  SALE_NOTARY: 'notary_',
  SALE_DELIVERY_JOB: 'del_job_sale_',

  // EVENT / BOOK A PRO domain
  PRO_CHEF: 'pro_chef_',
  PRO_CATER: 'pro_cater_',
  PRO_BAR: 'pro_bar_',
  PRO_COFFEE: 'pro_coffee_',
  PRO_DJ: 'pro_dj_',
  PRO_GENERIC: 'pro_svc_',
  EVENT_REQUEST: 'evt_',
  EVENT_BOOKING: 'evt_bkg_',
  EVENT_TRANSACTION: 'txn_evt_',
  EVENT_INQUIRY: 'inq_evt_',
  EVENT_CANCELLATION: 'cancel_evt_',

  // Shared platform entities
  USER: 'usr_',
  PROFILE: 'profile_',
  MESSAGE_THREAD: 'msg_thread_',
  MESSAGE: 'msg_',
  NOTIFICATION: 'note_',
  DOCUMENT: 'doc_',
  DOCUMENT_LICENSE: 'doc_license_',
  DOCUMENT_INSURANCE: 'doc_ins_',
  DOCUMENT_PERMIT: 'doc_permit_',
  DOCUMENT_WAIVER: 'doc_waiver_',
  REVIEW: 'rev_',
  FAVORITE: 'fav_',
  SUBSCRIPTION: 'sub_',
  AUDIT_LOG: 'log_',
  LOCATION: 'loc_',
  DELIVERY_OPTION: 'del_opt_'
};

// Generic generator
export function generate(prefKey, size = 10) {
  const prefix = UID_PREFIX[prefKey];
  if (!prefix) throw new Error(`Unknown UID prefix key: ${prefKey}`);
  return prefix + nanoid(size);
}

// Listing type mapping based on listingType + category
// listingType: RENT | SALE | EVENT_PRO
export function generateListingId(listingType, category) {
  if (!listingType) throw new Error('listingType required');
  const cat = (category || '').toLowerCase();
  switch (listingType) {
    case 'RENT': {
      if (cat.includes('truck')) return generate('RENT_TRUCK');
      if (cat.includes('trailer')) return generate('RENT_TRAILER');
      if (cat.includes('cart')) return generate('RENT_CART');
      if (cat.includes('kitchen')) return generate('RENT_KITCHEN');
      if (cat.includes('vending') || cat.includes('lot')) return generate('RENT_LOT');
      return generate('RENT_TRUCK'); // fallback generic rental prefix
    }
    case 'SALE': {
      if (cat.includes('truck')) return generate('SALE_TRUCK');
      if (cat.includes('trailer')) return generate('SALE_TRAILER');
      if (cat.includes('cart')) return generate('SALE_CART');
      // equipment falls back to cart prefix as spec didn't define separate
      if (cat.includes('equipment')) return generate('SALE_CART');
      return generate('SALE_TRUCK');
    }
    case 'EVENT_PRO': {
      if (cat.includes('chef')) return generate('PRO_CHEF');
      if (cat.includes('cater')) return generate('PRO_CATER');
      if (cat.includes('barista') || cat.includes('coffee')) return generate('PRO_COFFEE');
      if (cat.includes('dj')) return generate('PRO_DJ');
      if (cat.includes('bar')) return generate('PRO_BAR');
      return generate('PRO_GENERIC');
    }
    default:
      throw new Error(`Unknown listingType: ${listingType}`);
  }
}

// Specialized helpers (example usage for future create operations)
export const UIDs = {
  rentalBooking: () => generate('RENT_BOOKING'),
  rentalBundleBooking: () => generate('RENT_BUNDLE_BOOKING'),
  rentalCancellation: () => generate('RENT_CANCELLATION'),
  rentalTransaction: () => generate('RENT_TRANSACTION'),
  rentalPayout: () => generate('RENT_PAYOUT'),
  saleInquiry: () => generate('SALE_INQUIRY'),
  saleTransaction: () => generate('SALE_TRANSACTION'),
  saleTitleDoc: () => generate('SALE_TITLE_DOC'),
  saleNotary: () => generate('SALE_NOTARY'),
  saleDeliveryJob: () => generate('SALE_DELIVERY_JOB'),
  eventRequest: () => generate('EVENT_REQUEST'),
  eventBooking: () => generate('EVENT_BOOKING'),
  eventTransaction: () => generate('EVENT_TRANSACTION'),
  eventInquiry: () => generate('EVENT_INQUIRY'),
  eventCancellation: () => generate('EVENT_CANCELLATION'),
  user: () => generate('USER'),
  profile: () => generate('PROFILE'),
  messageThread: () => generate('MESSAGE_THREAD'),
  message: () => generate('MESSAGE'),
  notification: () => generate('NOTIFICATION'),
  document: () => generate('DOCUMENT'),
  documentLicense: () => generate('DOCUMENT_LICENSE'),
  documentInsurance: () => generate('DOCUMENT_INSURANCE'),
  documentPermit: () => generate('DOCUMENT_PERMIT'),
  documentWaiver: () => generate('DOCUMENT_WAIVER'),
  review: () => generate('REVIEW'),
  favorite: () => generate('FAVORITE'),
  subscription: () => generate('SUBSCRIPTION'),
  auditLog: () => generate('AUDIT_LOG'),
  location: () => generate('LOCATION'),
  deliveryOption: () => generate('DELIVERY_OPTION'),
  deliveryJobRent: () => generate('RENT_DELIVERY_JOB')
};

export default {
  generate,
  generateListingId,
  UIDs,
  UID_PREFIX
};