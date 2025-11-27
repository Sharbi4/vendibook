const FALLBACK_LISTING_PATH = '/listings';

export function buildListingPath(input) {
  if (!input) return FALLBACK_LISTING_PATH;
  if (typeof input === 'string' || typeof input === 'number') {
    return `/listing/${input}`;
  }

  const slugOrId = input.slug || input.id;
  if (!slugOrId) {
    return FALLBACK_LISTING_PATH;
  }
  return `/listing/${slugOrId}`;
}

export function buildShareUrl(listing) {
  const path = buildListingPath(listing);
  if (typeof window === 'undefined' || !window?.location?.origin) {
    return path;
  }
  return `${window.location.origin}${path}`;
}

export function formatListingTypeLabel(value) {
  const normalized = (value || '').toString().trim().toUpperCase();
  switch (normalized) {
    case 'EVENT_PRO':
      return 'Book an Event Pro';
    case 'SALE':
      return 'Inventory for sale';
    default:
      return 'Rent a food truck or trailer';
  }
}
