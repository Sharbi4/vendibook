import { MapPin, ShoppingCart, Store, Truck, Users, UtensilsCrossed } from 'lucide-react';

export const SEARCH_MODE = {
  RENT: 'rent',
  BUY: 'buy',
  EVENT_PRO: 'event_pro',
  VENDOR_MARKET: 'vendor_market'
};

// TODO: Align LISTING_TYPES values exactly with Neon listings.listing_type column before launch.
export const LISTING_TYPES = {
  FOOD_TRUCK: 'food-trucks',
  TRAILER: 'trailers',
  GHOST_KITCHEN: 'ghost-kitchens',
  VENDING_LOT: 'vending-lots',
  EVENT_PRO: 'event-pros',
  FOR_SALE: 'for-sale',
  VENDOR_SPACE: 'vendor_space'
};

export const MODE_LABELS = {
  [SEARCH_MODE.RENT]: 'Rent equipment',
  [SEARCH_MODE.BUY]: 'Buy equipment',
  [SEARCH_MODE.EVENT_PRO]: 'Book event pros',
  [SEARCH_MODE.VENDOR_MARKET]: 'Vendor markets'
};

export const MODE_CTA_COPY = {
  [SEARCH_MODE.RENT]: 'Find rentals',
  [SEARCH_MODE.BUY]: 'Find equipment for sale',
  [SEARCH_MODE.EVENT_PRO]: 'Find Event Pros',
  [SEARCH_MODE.VENDOR_MARKET]: 'Find vendor markets'
};

export const CATEGORY_OPTIONS = {
  [SEARCH_MODE.RENT]: [
    { value: LISTING_TYPES.FOOD_TRUCK, label: 'Food trucks' },
    { value: LISTING_TYPES.TRAILER, label: 'Food trailers' },
    { value: LISTING_TYPES.GHOST_KITCHEN, label: 'Ghost kitchens' },
    { value: LISTING_TYPES.VENDING_LOT, label: 'Vending lots' }
  ],
  [SEARCH_MODE.BUY]: [
    { value: LISTING_TYPES.FOR_SALE, label: 'Trucks & trailers for sale' }
  ],
  [SEARCH_MODE.EVENT_PRO]: [
    { value: LISTING_TYPES.EVENT_PRO, label: 'Event pros' }
  ],
  [SEARCH_MODE.VENDOR_MARKET]: [
    { value: LISTING_TYPES.VENDOR_SPACE, label: 'Vendor markets' }
  ]
};

const CATEGORY_ICON_MAP = {
  [LISTING_TYPES.FOOD_TRUCK]: Truck,
  [LISTING_TYPES.TRAILER]: Truck,
  [LISTING_TYPES.GHOST_KITCHEN]: UtensilsCrossed,
  [LISTING_TYPES.VENDING_LOT]: MapPin,
  [LISTING_TYPES.EVENT_PRO]: Users,
  [LISTING_TYPES.FOR_SALE]: ShoppingCart,
  [LISTING_TYPES.VENDOR_SPACE]: Store
};

export const DEFAULT_FILTERS = {
  mode: SEARCH_MODE.RENT,
  listingType: '',
  locationText: '',
  city: '',
  state: '',
  startDate: '',
  endDate: '',
  page: 1
};

export const ADVANCED_FILTER_PLACEHOLDERS = [
  { key: 'priceRange', label: 'Price range', description: 'Set min / max budget' },
  { key: 'amenities', label: 'Amenities', description: 'Power, water, delivery, indoor/outdoor' },
  { key: 'radius', label: 'Service radius', description: 'Filter by delivery distance' }
];

export function getCategoryOptionsForMode(mode = SEARCH_MODE.RENT) {
  return CATEGORY_OPTIONS[mode] || [];
}

export function getCategoryLabel(mode, value) {
  if (!value) return 'All categories';
  const option = getCategoryOptionsForMode(mode).find((item) => item.value === value);
  return option?.label || 'All categories';
}

export function getModeLabel(mode) {
  return MODE_LABELS[mode] || MODE_LABELS[SEARCH_MODE.RENT];
}

export function getModeCtaCopy(mode) {
  return MODE_CTA_COPY[mode] || MODE_CTA_COPY[SEARCH_MODE.RENT];
}

export function getCategoryIconComponent(value) {
  return CATEGORY_ICON_MAP[value] || Store;
}

export function deriveCityState(rawText = '') {
  if (!rawText) return { city: '', state: '' };
  const segments = rawText.split(',').map((segment) => segment.trim()).filter(Boolean);
  if (segments.length === 0) {
    return { city: '', state: '' };
  }
  if (segments.length === 1) {
    const text = segments[0];
    if (text.length <= 2) {
      return { city: '', state: text.toUpperCase() };
    }
    return { city: text, state: '' };
  }
  const [city, state] = segments;
  return {
    city,
    state: state.slice(0, 2).toUpperCase()
  };
}

export function parseFiltersFromSearchParams(searchParams) {
  const params = typeof searchParams.get === 'function' ? searchParams : new URLSearchParams(searchParams);
  const mode = params.get('mode') || DEFAULT_FILTERS.mode;
  const locationText = params.get('location') || '';
  const cityParam = params.get('city') || '';
  const stateParam = params.get('state') || '';
  const startDate = params.get('startDate') || '';
  const endDate = params.get('endDate') || '';
  const listingType = params.get('listingType') || '';
  const page = Number(params.get('page')) > 0 ? Number(params.get('page')) : DEFAULT_FILTERS.page;

  const derived = locationText ? deriveCityState(locationText) : { city: cityParam, state: stateParam };

  return {
    ...DEFAULT_FILTERS,
    mode: Object.values(SEARCH_MODE).includes(mode) ? mode : DEFAULT_FILTERS.mode,
    listingType,
    locationText: locationText || [cityParam, stateParam].filter(Boolean).join(', '),
    city: derived.city || cityParam,
    state: derived.state || stateParam.toUpperCase(),
    startDate,
    endDate,
    page
  };
}

export function buildSearchParamsFromFilters(filters = DEFAULT_FILTERS) {
  const merged = { ...DEFAULT_FILTERS, ...filters };
  const params = new URLSearchParams();
  params.set('mode', merged.mode);
  if (merged.city) params.set('city', merged.city);
  if (merged.state) params.set('state', merged.state);
  if (merged.locationText) params.set('location', merged.locationText);
  if (merged.listingType) params.set('listingType', merged.listingType);
  if (merged.startDate) params.set('startDate', merged.startDate);
  if (merged.endDate) params.set('endDate', merged.endDate);
  if (merged.page && merged.page > 1) params.set('page', String(merged.page));
  return params;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return 'Flexible dates';
  if (startDate && !endDate) return `${startDate} (select end date)`;
  if (!startDate && endDate) return `Before ${endDate}`;
  return `${startDate} → ${endDate}`;
}
