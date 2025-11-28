export const SEARCH_MODE = {
  RENT: 'rent',
  FOR_SALE: 'for_sale',
  EVENT_PRO: 'event_pro'
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
  [SEARCH_MODE.RENT]: 'Rent',
  [SEARCH_MODE.FOR_SALE]: 'For Sale',
  [SEARCH_MODE.EVENT_PRO]: 'Event Pro'
};

export const MODE_CTA_COPY = {
  [SEARCH_MODE.RENT]: 'Search Rentals',
  [SEARCH_MODE.FOR_SALE]: 'Search For Sale',
  [SEARCH_MODE.EVENT_PRO]: 'Search Event Pros'
};

export const CATEGORY_OPTIONS = {
  [SEARCH_MODE.RENT]: [
    { value: LISTING_TYPES.FOOD_TRUCK, label: 'Food Trucks' },
    { value: LISTING_TYPES.TRAILER, label: 'Trailers' },
    { value: LISTING_TYPES.GHOST_KITCHEN, label: 'Ghost Kitchens' },
    { value: LISTING_TYPES.VENDING_LOT, label: 'Vending Lots' },
    { value: 'equipment', label: 'Equipment' }
  ],
  [SEARCH_MODE.FOR_SALE]: [
    { value: LISTING_TYPES.FOOD_TRUCK, label: 'Food Trucks' },
    { value: LISTING_TYPES.TRAILER, label: 'Trailers' },
    { value: 'ghost-kitchen-equipment', label: 'Ghost Kitchen Equipment' },
    { value: 'vending-machines', label: 'Vending Machines' },
    { value: 'commercial-equipment', label: 'Commercial Equipment' }
  ],
  [SEARCH_MODE.EVENT_PRO]: [
    { value: LISTING_TYPES.EVENT_PRO, label: 'Event Pros' }
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

// Event Pro specific filter options
export const EVENT_TYPES = [
  { value: 'wedding', label: '💒 Wedding', icon: '💒' },
  { value: 'corporate', label: '🏢 Corporate', icon: '🏢' },
  { value: 'festival', label: '🎪 Festival', icon: '🎪' },
  { value: 'private-party', label: '🎉 Private Party', icon: '🎉' },
  { value: 'nonprofit', label: '❤️ Nonprofit', icon: '❤️' },
  { value: 'school', label: '🎓 School Event', icon: '🎓' },
  { value: 'community', label: '🏘️ Community Event', icon: '🏘️' }
];

export const SERVICE_CATEGORIES = [
  { value: 'caterers', label: '🍽️ Caterers', icon: '🍽️' },
  { value: 'djs', label: '🎵 DJs', icon: '🎵' },
  { value: 'bartenders', label: '🍹 Bartenders', icon: '🍹' },
  { value: 'chefs', label: '👨‍🍳 Chefs', icon: '👨‍🍳' },
  { value: 'photographers', label: '📸 Photographers', icon: '📸' },
  { value: 'videographers', label: '🎥 Videographers', icon: '🎥' },
  { value: 'bounce-houses', label: '🎈 Bounce Houses', icon: '🎈' },
  { value: 'entertainers', label: '🎭 Entertainers', icon: '🎭' },
  { value: 'decor', label: '💐 Décor', icon: '💐' },
  { value: 'generators', label: '⚡ Generators', icon: '⚡' },
  { value: 'staging', label: '🎪 Staging', icon: '🎪' },
  { value: 'lighting', label: '💡 Lighting', icon: '💡' }
];

// Legacy filter placeholders (for backward compatibility with original HomePage)
export const ADVANCED_FILTER_PLACEHOLDERS = [
  { key: 'priceRange', label: 'Price range', description: 'Set min / max budget' },
  { key: 'amenities', label: 'Amenities', description: 'Power, water, delivery, indoor/outdoor' },
  { key: 'radius', label: 'Service radius', description: 'Filter by delivery distance' }
];

// Legacy secondary filters (for backward compatibility)
export const EVENT_PRO_SECONDARY_FILTERS = [
  { key: 'capacity', label: 'Capacity/Crowd Size', description: 'Expected number of guests' },
  { key: 'travel', label: 'Travel/Delivery Included', description: 'Provider travels to your location' },
  { key: 'availability', label: 'Availability Calendar', description: 'See real-time availability' },
  { key: 'license', label: 'License/Permit Requirements', description: 'Certifications and permits' },
  { key: 'instantBooking', label: 'Instant Booking', description: 'Book immediately without approval' },
  { key: 'reviews', label: 'Reviews & Ratings', description: 'Minimum rating filter' },
  { key: 'insurance', label: 'Insurance Provided/Required', description: 'Coverage details' }
];

// Rent-specific advanced filters
export const RENT_ADVANCED_FILTERS = [
  { key: 'dailyRate', label: '💰 Daily Rate Range', type: 'range', description: 'Min/max daily rate' },
  { key: 'delivery', label: '🚚 Delivery Available', type: 'toggle', description: 'Yes/No/Either' },
  { key: 'duration', label: '⏰ Rental Duration', type: 'dropdown', options: ['Daily', 'Weekly', 'Monthly'] },
  { key: 'size', label: '📏 Size/Capacity', type: 'dropdown', options: ['Small', 'Medium', 'Large', 'XL'] },
  { key: 'minRating', label: '⭐ Minimum Rating', type: 'dropdown', options: ['4.0+', '4.5+', '5.0'] },
  { key: 'verifiedOnly', label: '✓ Verified Hosts Only', type: 'checkbox' },
  { key: 'insurance', label: '🛡️ Insurance Included', type: 'checkbox' },
  { key: 'permits', label: '📜 Permits Included', type: 'checkbox' }
];

// For Sale-specific advanced filters
export const FOR_SALE_ADVANCED_FILTERS = [
  { key: 'year', label: '📅 Year', type: 'dropdown', options: ['2024', '2023', '2022', '2021', 'Older'] },
  { key: 'size', label: '📏 Size/Type', type: 'dropdown', description: 'Varies by category' },
  { key: 'condition', label: '⚙️ Condition', type: 'multi', options: ['New', 'Like New', 'Good', 'Fair'] },
  { key: 'equipment', label: '🔧 Equipment Included', type: 'checkboxList' },
  { key: 'title', label: '📜 Title Status', type: 'dropdown', options: ['Clean', 'Salvage', 'Rebuilt'] },
  { key: 'serviceHistory', label: '🛠️ Service History Available', type: 'checkbox' },
  { key: 'photoVerification', label: '📸 Photo Verification', type: 'checkbox' },
  { key: 'financing', label: '💳 Financing Available', type: 'checkbox' },
  { key: 'delivery', label: '🚛 Delivery Available', type: 'checkbox' }
];

// Event Pro-specific advanced filters
export const EVENT_PRO_ADVANCED_FILTERS = [
  { key: 'travel', label: '🚗 Travel Included', type: 'checkbox' },
  { key: 'instantBooking', label: '⚡ Instant Booking', type: 'checkbox' },
  { key: 'insurance', label: '🛡️ Insurance Provided', type: 'checkbox' },
  { key: 'minRating', label: '⭐ Minimum Rating', type: 'dropdown', options: ['Any', '4.0+', '4.5+', '5.0'] },
  { key: 'responseTime', label: '⏱️ Response Time', type: 'dropdown', options: ['<1hr', '<4hr', '<24hr', 'Any'] },
  { key: 'experience', label: '👔 Experience Level', type: 'dropdown', options: ['Any', '1-3yrs', '3-5yrs', '5+yrs'] },
  { key: 'packages', label: '📦 Package Deals Available', type: 'checkbox' },
  { key: 'addons', label: '➕ Add-ons Available', type: 'checkbox' }
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
