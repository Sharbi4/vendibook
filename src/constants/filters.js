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
  [SEARCH_MODE.RENT]: 'Search rentals',
  [SEARCH_MODE.BUY]: 'Search for sale listings',
  [SEARCH_MODE.EVENT_PRO]: 'Find event pros',
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
    { value: LISTING_TYPES.VENDOR_SPACE, label: 'Vendor markets & vendor spaces' }
  ]
};

const CATEGORY_ICON_NAMES = {
  [LISTING_TYPES.FOOD_TRUCK]: 'truck',
  [LISTING_TYPES.TRAILER]: 'trailer',
  [LISTING_TYPES.GHOST_KITCHEN]: 'kitchen',
  [LISTING_TYPES.VENDING_LOT]: 'map_pin',
  [LISTING_TYPES.EVENT_PRO]: 'users',
  [LISTING_TYPES.FOR_SALE]: 'cart',
  [LISTING_TYPES.VENDOR_SPACE]: 'store'
};

export function getCategoryIcon(value) {
  return CATEGORY_ICON_NAMES[value] || 'store';
}

export const DEFAULT_FILTERS = {
  mode: SEARCH_MODE.RENT,
  listingType: '',
  locationText: '',
  locationLabel: '',
  city: '',
  state: '',
  latitude: '',
  longitude: '',
  distanceMiles: '',
  startDate: '',
  endDate: '',
  page: 1
};

export const DISTANCE_FILTER_OPTIONS = [
  { label: 'Any distance', value: '' },
  { label: 'Within 5 miles', value: 5 },
  { label: 'Within 10 miles', value: 10 },
  { label: 'Within 25 miles', value: 25 },
  { label: 'Within 50 miles', value: 50 }
];

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
  const locationLabel = params.get('locationLabel') || '';
  const cityParam = params.get('city') || '';
  const stateParam = params.get('state') || '';
  const latitudeParam = params.get('lat');
  const longitudeParam = params.get('lng');
  const distanceParam = params.get('distance');
  const startDate = params.get('startDate') || '';
  const endDate = params.get('endDate') || '';
  const listingType = params.get('listingType') || '';
  const page = Number(params.get('page')) > 0 ? Number(params.get('page')) : DEFAULT_FILTERS.page;

  const derived = locationText ? deriveCityState(locationText) : { city: cityParam, state: stateParam };
  const parsedLat = latitudeParam != null && latitudeParam !== '' ? Number(latitudeParam) : '';
  const parsedLng = longitudeParam != null && longitudeParam !== '' ? Number(longitudeParam) : '';
  const latitude = Number.isFinite(parsedLat) ? parsedLat : '';
  const longitude = Number.isFinite(parsedLng) ? parsedLng : '';
  const safeDistance = distanceParam != null && distanceParam !== '' ? Number(distanceParam) : '';

  return {
    ...DEFAULT_FILTERS,
    mode: Object.values(SEARCH_MODE).includes(mode) ? mode : DEFAULT_FILTERS.mode,
    listingType,
    locationText: locationText || [cityParam, stateParam].filter(Boolean).join(', '),
    locationLabel: locationLabel || locationText || [cityParam, stateParam].filter(Boolean).join(', '),
    city: derived.city || cityParam,
    state: derived.state || stateParam.toUpperCase(),
    latitude,
    longitude,
    distanceMiles: Number.isFinite(safeDistance) && safeDistance > 0 ? safeDistance : '',
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
  if (merged.locationLabel) params.set('locationLabel', merged.locationLabel);
  if (Number.isFinite(merged.latitude)) params.set('lat', String(merged.latitude));
  if (Number.isFinite(merged.longitude)) params.set('lng', String(merged.longitude));
  if (merged.distanceMiles) params.set('distance', String(merged.distanceMiles));
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
