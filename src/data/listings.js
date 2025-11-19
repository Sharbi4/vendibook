/**
 * Vendibook Core Listing Model
 *
 * Defines listing types and provides mock data for the marketplace.
 * In production, this would be replaced with API calls.
 */

// Listing type constants
export const LISTING_TYPES = {
  RENT: 'RENT',
  SALE: 'SALE',
  EVENT_PRO: 'EVENT_PRO'
};

// Price unit constants
export const PRICE_UNITS = {
  PER_DAY: 'per day',
  PER_HOUR: 'per hour',
  ONE_TIME: 'one-time'
};

/**
 * @typedef {Object} Listing
 * @property {string} id
 * @property {string} title
 * @property {string} listingType - RENT | SALE | EVENT_PRO
 * @property {string} category
 * @property {string} city
 * @property {string} state
 * @property {number} price
 * @property {string} priceUnit
 * @property {number} rating
 * @property {number} reviewCount
 * @property {string[]} tags
 * @property {string} imageUrl
 * @property {string} hostName
 * @property {boolean} isVerified
 * @property {string} description
 * @property {string[]} highlights
 * @property {boolean} deliveryAvailable
 */

// Mock listing data
export const listings = [
  {
    id: '1',
    title: 'Fully Equipped Taco Truck - LA Style',
    listingType: LISTING_TYPES.RENT,
    category: 'food-trucks',
    city: 'Tucson',
    state: 'AZ',
    price: 250,
    priceUnit: PRICE_UNITS.PER_DAY,
    rating: 4.9,
    reviewCount: 32,
    tags: ['Power', 'Water', 'Propane', 'Full Kitchen', 'Delivery Available'],
    imageUrl: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
    hostName: 'Maria Rodriguez',
    isVerified: true,
    deliveryAvailable: true,
    description: 'Professional taco truck perfect for events, festivals, and daily operations. Fully equipped with commercial-grade appliances, fresh water system, and propane setup. Health department approved and ready to roll.',
    highlights: [
      'Commercial kitchen with griddle, fryer, and prep stations',
      'Fresh water (40 gal) and grey water (50 gal) tanks',
      '100 lb propane system with dual tanks',
      'Point-of-sale system and WiFi ready',
      'Full health inspection documentation'
    ]
  },
  {
    id: '2',
    title: 'Wood-Fired Pizza Trailer - Professional Setup',
    listingType: LISTING_TYPES.RENT,
    category: 'trailers',
    city: 'Phoenix',
    state: 'AZ',
    price: 180,
    priceUnit: PRICE_UNITS.PER_DAY,
    rating: 4.8,
    reviewCount: 28,
    tags: ['Power', 'Water', 'Wood-fired Oven', 'Prep Station'],
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    hostName: 'Tony Napoli',
    isVerified: true,
    deliveryAvailable: true,
    description: 'Authentic wood-fired pizza trailer with Italian imported oven. Perfect for weddings, corporate events, and festivals. Produces 80-100 pizzas per service.',
    highlights: [
      'Authentic Italian wood-fired oven',
      'Reaches 900°F in 20 minutes',
      'Stainless steel prep stations',
      'Refrigerated ingredient storage',
      'Towable with standard vehicle'
    ]
  },
  {
    id: '3',
    title: 'Premium Ghost Kitchen - 24/7 Access',
    listingType: LISTING_TYPES.RENT,
    category: 'ghost-kitchens',
    city: 'Tucson',
    state: 'AZ',
    price: 150,
    priceUnit: PRICE_UNITS.PER_DAY,
    rating: 5.0,
    reviewCount: 15,
    tags: ['Full Kitchen', 'Storage', '24/7 Access', 'Walk-in Cooler'],
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    hostName: 'CloudKitchen Co.',
    isVerified: true,
    deliveryAvailable: false,
    description: 'Professional commercial kitchen space for delivery-only restaurant operations. Fully licensed and health department approved. Perfect for scaling your food business.',
    highlights: [
      '24/7 secure access with key card',
      'Walk-in cooler and freezer',
      'Commercial gas range and griddle',
      'Dry storage and prep areas',
      'High-speed internet and POS ready'
    ]
  },
  {
    id: '4',
    title: 'Downtown Vending Location - High Traffic',
    listingType: LISTING_TYPES.RENT,
    category: 'vending-lots',
    city: 'Tempe',
    state: 'AZ',
    price: 120,
    priceUnit: PRICE_UNITS.PER_DAY,
    rating: 4.7,
    reviewCount: 45,
    tags: ['High Foot Traffic', 'Power Hookup', 'Weekend Events', 'Permits Included'],
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    hostName: 'Downtown Development Authority',
    isVerified: true,
    deliveryAvailable: false,
    description: 'Prime downtown location with 5,000+ daily foot traffic. Near ASU campus, office buildings, and retail. All permits included.',
    highlights: [
      '5,000+ daily foot traffic',
      'Power and water hookups available',
      'Weekend farmer\'s market access',
      'All city permits handled',
      'Flexible lease terms'
    ]
  },
  {
    id: '5',
    title: 'Award-Winning Chef - Mexican Cuisine',
    listingType: LISTING_TYPES.EVENT_PRO,
    category: 'chefs',
    city: 'Phoenix',
    state: 'AZ',
    price: 75,
    priceUnit: PRICE_UNITS.PER_HOUR,
    rating: 4.9,
    reviewCount: 67,
    tags: ['Certified', 'Catering License', 'Menu Planning', '10+ Years Exp'],
    imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80',
    hostName: 'Chef Carlos Mendez',
    isVerified: true,
    deliveryAvailable: false,
    description: 'Professional chef specializing in authentic Mexican cuisine. Available for private events, catering, and menu development. Award-winning recipes and presentation.',
    highlights: [
      'ServSafe certified',
      'Catering license and insurance',
      'Custom menu development',
      'Authentic family recipes',
      'Available for tastings'
    ]
  },
  {
    id: '6',
    title: 'Vintage Coffee Cart - Fully Restored',
    listingType: LISTING_TYPES.RENT,
    category: 'trailers',
    city: 'Scottsdale',
    state: 'AZ',
    price: 95,
    priceUnit: PRICE_UNITS.PER_DAY,
    rating: 4.6,
    reviewCount: 19,
    tags: ['Espresso Machine', 'Power', 'Compact', 'Instagram-worthy'],
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    hostName: 'Retro Rentals',
    isVerified: true,
    deliveryAvailable: true,
    description: 'Beautifully restored vintage coffee cart perfect for weddings, corporate events, and pop-ups. Instagram-ready aesthetic with professional espresso equipment.',
    highlights: [
      'Professional espresso machine',
      'Vintage aesthetic',
      'Compact and mobile',
      'Power supply included',
      'Perfect for weddings'
    ]
  },
  {
    id: '7',
    title: '2022 Food Truck - Like New',
    listingType: LISTING_TYPES.SALE,
    category: 'for-sale',
    city: 'Phoenix',
    state: 'AZ',
    price: 45000,
    priceUnit: PRICE_UNITS.ONE_TIME,
    rating: 5.0,
    reviewCount: 8,
    tags: ['Title Verified', 'Low Miles', 'Full Inspection', 'Financing Available'],
    imageUrl: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
    hostName: 'Mobile Kitchen Sales',
    isVerified: true,
    deliveryAvailable: true,
    description: '2022 Chevrolet P30 food truck with only 8,500 miles. Fully equipped commercial kitchen. Ready for immediate operation. Clean title, full inspection available.',
    highlights: [
      'Only 8,500 miles',
      'Full commercial kitchen',
      'Recent health inspection',
      'Clean title in hand',
      'Financing options available'
    ]
  },
  {
    id: '8',
    title: 'BBQ Smoker Trailer - Competition Ready',
    listingType: LISTING_TYPES.RENT,
    category: 'trailers',
    city: 'Mesa',
    state: 'AZ',
    price: 220,
    priceUnit: PRICE_UNITS.PER_DAY,
    rating: 4.9,
    reviewCount: 52,
    tags: ['Large Smoker', 'Prep Station', 'Power', 'Water Hookup'],
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    hostName: 'BBQ Masters LLC',
    isVerified: true,
    deliveryAvailable: true,
    description: 'Professional competition-grade BBQ smoker trailer. Large capacity for events up to 500 people. Temperature-controlled smoking chambers.',
    highlights: [
      'Competition-grade smoker',
      'Capacity for 500+ servings',
      'Temperature control system',
      'Prep and serving stations',
      'Award-winning equipment'
    ]
  },
  {
    id: '9',
    title: 'Professional Caterer - Italian Cuisine',
    listingType: LISTING_TYPES.EVENT_PRO,
    category: 'caterers',
    city: 'Scottsdale',
    state: 'AZ',
    price: 65,
    priceUnit: PRICE_UNITS.PER_HOUR,
    rating: 4.8,
    reviewCount: 43,
    tags: ['Full Service', 'Equipment Included', 'Menu Planning', 'Wine Pairing'],
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
    hostName: 'Bella Cucina Catering',
    isVerified: true,
    deliveryAvailable: false,
    description: 'Full-service Italian catering for weddings, corporate events, and private parties. Custom menus, professional service staff, and complete event coordination.',
    highlights: [
      'Custom Italian menus',
      'Professional service staff',
      'Equipment and rentals included',
      'Wine pairing expertise',
      'Event coordination available'
    ]
  },
  {
    id: '10',
    title: 'Craft Coffee Barista - Specialty Drinks',
    listingType: LISTING_TYPES.EVENT_PRO,
    category: 'baristas',
    city: 'Tempe',
    state: 'AZ',
    price: 50,
    priceUnit: PRICE_UNITS.PER_HOUR,
    rating: 4.7,
    reviewCount: 31,
    tags: ['Latte Art', 'Mobile Equipment', 'Custom Drinks', 'SCA Certified'],
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80',
    hostName: 'Java Jones',
    isVerified: true,
    deliveryAvailable: false,
    description: 'SCA-certified barista specializing in specialty coffee service for corporate events, weddings, and private parties. Mobile espresso setup available.',
    highlights: [
      'SCA certified barista',
      'Specialty latte art',
      'Mobile espresso setup',
      'Custom drink menus',
      'Premium beans sourced locally'
    ]
  },
  {
    id: '11',
    title: 'Commercial Kitchen Equipment Set',
    listingType: LISTING_TYPES.SALE,
    category: 'equipment',
    city: 'Phoenix',
    state: 'AZ',
    price: 8500,
    priceUnit: PRICE_UNITS.ONE_TIME,
    rating: 4.5,
    reviewCount: 12,
    tags: ['Commercial Grade', 'NSF Certified', 'Warranty Included'],
    imageUrl: 'https://images.unsplash.com/photo-1556910636-196352d61e46?w=800&auto=format&fit=crop&q=80',
    hostName: 'Pro Kitchen Supply',
    isVerified: true,
    deliveryAvailable: true,
    description: 'Complete commercial kitchen equipment package including griddle, fryer, prep tables, and refrigeration. NSF certified and like-new condition.',
    highlights: [
      'Complete kitchen package',
      'NSF certified equipment',
      '6-month warranty',
      'Installation available',
      'Financing options'
    ]
  },
  {
    id: '12',
    title: 'Event Staff Coordinator - Full Service',
    listingType: LISTING_TYPES.EVENT_PRO,
    category: 'event-staff',
    city: 'Mesa',
    state: 'AZ',
    price: 55,
    priceUnit: PRICE_UNITS.PER_HOUR,
    rating: 4.9,
    reviewCount: 28,
    tags: ['Team Management', 'Bar Service', 'Serving Staff', 'Event Coordination'],
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
    hostName: 'Elite Events AZ',
    isVerified: true,
    deliveryAvailable: false,
    description: 'Professional event staffing and coordination. Experienced team for weddings, corporate events, and large gatherings. Full service including bartenders, servers, and coordinators.',
    highlights: [
      'Experienced event team',
      'Licensed bartenders',
      'Professional servers',
      'Event coordination',
      'Flexible team sizes'
    ]
  }
];

/**
 * Get listing type display info
 */
export const getListingTypeInfo = (listingType) => {
  const typeMap = {
    [LISTING_TYPES.RENT]: {
      label: 'For Rent',
      color: '#FF5124',
      bgColor: '#FFF3F0',
      actionLabel: 'Request Rental',
      pricePrefix: 'From'
    },
    [LISTING_TYPES.SALE]: {
      label: 'For Sale',
      color: '#FFB42C',
      bgColor: '#FFF9E6',
      actionLabel: 'Contact Seller',
      pricePrefix: ''
    },
    [LISTING_TYPES.EVENT_PRO]: {
      label: 'Event Pro',
      color: '#343434',
      bgColor: '#F7F7F7',
      actionLabel: 'Check Availability',
      pricePrefix: 'Rate'
    }
  };
  return typeMap[listingType] || typeMap[LISTING_TYPES.RENT];
};

/**
 * Format price with unit
 */
export const formatPrice = (price, priceUnit) => {
  if (priceUnit === PRICE_UNITS.ONE_TIME) {
    return `$${price.toLocaleString()}`;
  }
  return `$${price.toLocaleString()} ${priceUnit}`;
};

/**
 * Get category options by listing type
 */
export const getCategoriesByType = (listingType) => {
  const categories = {
    [LISTING_TYPES.RENT]: [
      { id: 'all', name: 'All' },
      { id: 'food-trucks', name: 'Food Trucks' },
      { id: 'trailers', name: 'Trailers' },
      { id: 'ghost-kitchens', name: 'Ghost Kitchens' },
      { id: 'vending-lots', name: 'Vending Lots' }
    ],
    [LISTING_TYPES.SALE]: [
      { id: 'all', name: 'All' },
      { id: 'for-sale', name: 'Food Trucks' },
      { id: 'trailers-sale', name: 'Trailers' },
      { id: 'equipment', name: 'Equipment' }
    ],
    [LISTING_TYPES.EVENT_PRO]: [
      { id: 'all', name: 'All' },
      { id: 'chefs', name: 'Chefs' },
      { id: 'caterers', name: 'Caterers' },
      { id: 'baristas', name: 'Baristas' },
      { id: 'event-staff', name: 'Event Staff' }
    ]
  };
  return categories[listingType] || categories[LISTING_TYPES.RENT];
};

/**
 * Filter listings by criteria
 */
export const filterListings = (listings, filters) => {
  return listings.filter(listing => {
    // Listing type filter
    if (filters.listingType && filters.listingType !== 'all' && listing.listingType !== filters.listingType) {
      return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all' && listing.category !== filters.category) {
      return false;
    }

    // Location filter
    if (filters.location) {
      const searchLower = filters.location.toLowerCase();
      const locationMatch = listing.city.toLowerCase().includes(searchLower) ||
                           listing.state.toLowerCase().includes(searchLower);
      if (!locationMatch) return false;
    }

    // Price filter
    if (filters.priceMin && listing.price < parseInt(filters.priceMin)) {
      return false;
    }
    if (filters.priceMax && listing.price > parseInt(filters.priceMax)) {
      return false;
    }

    // Delivery filter
    if (filters.deliveryOnly && !listing.deliveryAvailable) {
      return false;
    }

    // Verified filter
    if (filters.verifiedOnly && !listing.isVerified) {
      return false;
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity =>
        listing.tags.some(tag => tag.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });
};

/**
 * Get a single listing by ID
 */
export const getListingById = (id) => {
  return listings.find(listing => listing.id === id);
};
