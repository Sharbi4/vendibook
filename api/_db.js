/**
 * In-memory data store for Vendibook API
 * This is a prototype implementation that can be replaced with a real database later
 * (e.g., Postgres, Supabase, MongoDB)
 */

// Complete mock listings data based on src/data/listings.js
const initialListings = [
  {
    id: '1',
    title: 'Fully Equipped Taco Truck - LA Style',
    listingType: 'RENT',
    category: 'food-trucks',
    city: 'Tucson',
    state: 'AZ',
    location: 'Tucson, AZ',
    price: 250,
    priceUnit: 'per day',
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
    listingType: 'RENT',
    category: 'trailers',
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 180,
    priceUnit: 'per day',
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
    listingType: 'RENT',
    category: 'ghost-kitchens',
    city: 'Tucson',
    state: 'AZ',
    location: 'Tucson, AZ',
    price: 150,
    priceUnit: 'per day',
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
    listingType: 'RENT',
    category: 'vending-lots',
    city: 'Tempe',
    state: 'AZ',
    location: 'Tempe, AZ',
    price: 120,
    priceUnit: 'per day',
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
    listingType: 'EVENT_PRO',
    category: 'chefs',
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 75,
    priceUnit: 'per hour',
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
    listingType: 'RENT',
    category: 'trailers',
    city: 'Scottsdale',
    state: 'AZ',
    location: 'Scottsdale, AZ',
    price: 95,
    priceUnit: 'per day',
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
    listingType: 'SALE',
    category: 'for-sale',
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 45000,
    priceUnit: 'one-time',
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
    listingType: 'RENT',
    category: 'trailers',
    city: 'Mesa',
    state: 'AZ',
    location: 'Mesa, AZ',
    price: 220,
    priceUnit: 'per day',
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
    listingType: 'EVENT_PRO',
    category: 'caterers',
    city: 'Scottsdale',
    state: 'AZ',
    location: 'Scottsdale, AZ',
    price: 65,
    priceUnit: 'per hour',
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
    listingType: 'EVENT_PRO',
    category: 'baristas',
    city: 'Tempe',
    state: 'AZ',
    location: 'Tempe, AZ',
    price: 50,
    priceUnit: 'per hour',
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
    listingType: 'SALE',
    category: 'equipment',
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 8500,
    priceUnit: 'one-time',
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
    listingType: 'EVENT_PRO',
    category: 'event-staff',
    city: 'Mesa',
    state: 'AZ',
    location: 'Mesa, AZ',
    price: 55,
    priceUnit: 'per hour',
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

// In-memory collections
let users = [];
let listings = JSON.parse(JSON.stringify(initialListings));
let hostListings = [];
let bookings = [];
let inquiries = [];
let eventRequests = [];

// Simple token store for prototype auth
const tokenToUser = new Map();

// ============================================================================
// USER MANAGEMENT
// ============================================================================
const userDB = {
  addUser(user) {
    const newUser = {
      ...user,
      // Stripe Identity verification fields
      identityVerified: false,
      stripeVerificationStatus: 'none', // none, pending, verified, failed, canceled
      stripeVerificationSessionID: null,
      stripeVerifiedAt: null,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },

  getUserByEmail(email) {
    return users.find(u => u.email === email);
  },

  getUserById(id) {
    return users.find(u => u.id === id);
  },

  getUserByClerkId(clerkId) {
    return users.find(u => u.clerkId === clerkId);
  },

  updateUser(id, updates) {
    const user = users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    }
    return user;
  },

  updateVerificationStatus(id, status, sessionId = null) {
    const user = users.find(u => u.id === id);
    if (user) {
      user.stripeVerificationStatus = status;
      if (sessionId) {
        user.stripeVerificationSessionID = sessionId;
      }
      if (status === 'verified') {
        user.identityVerified = true;
        user.stripeVerifiedAt = new Date().toISOString();
      }
      user.updatedAt = new Date().toISOString();
    }
    return user;
  },

  getAllUsers() {
    return users;
  }
};

// ============================================================================
// AUTHENTICATION TOKEN MANAGEMENT
// ============================================================================
const authDB = {
  storeToken(token, userId) {
    tokenToUser.set(token, userId);
  },
  
  getUserIdFromToken(token) {
    return tokenToUser.get(token);
  },
  
  clearToken(token) {
    tokenToUser.delete(token);
  }
};

// ============================================================================
// PUBLIC LISTINGS (Marketplace)
// ============================================================================
const listingsDB = {
  // Get all listings (with optional filters)
  getAll(filters = {}) {
    return this.search(filters);
  },
  
  // Get listing by ID
  getById(id) {
    return listings.find(l => l.id === id);
  },
  
  // Search listings with advanced filtering
  search(filters = {}) {
    return listings.filter(listing => {
      // Filter by listing type (RENT, SALE, EVENT_PRO)
      if (filters.listingType && listing.listingType !== filters.listingType) {
        return false;
      }
      
      // Filter by category
      if (filters.category && filters.category !== 'all' && listing.category !== filters.category) {
        return false;
      }
      
      // Filter by location (substring match)
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const locationMatch = 
          listing.city.toLowerCase().includes(locationLower) ||
          listing.state.toLowerCase().includes(locationLower) ||
          listing.location.toLowerCase().includes(locationLower);
        if (!locationMatch) return false;
      }
      
      // Filter by price range
      if (filters.priceMin && listing.price < parseFloat(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && listing.price > parseFloat(filters.priceMax)) {
        return false;
      }
      
      // Filter by delivery availability
      if (filters.deliveryOnly && !listing.deliveryAvailable) {
        return false;
      }
      
      // Filter by verified vendors only
      if (filters.verifiedOnly && !listing.isVerified) {
        return false;
      }
      
      // Filter by amenities (at least one match)
      if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
        const hasAmenity = filters.amenities.some(amenity =>
          listing.tags.some(tag => tag.toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!hasAmenity) return false;
      }
      
      // Text search in title and description
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = listing.title.toLowerCase().includes(searchLower);
        const descMatch = listing.description.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }
      
      return true;
    });
  }
};

// ============================================================================
// HOST LISTINGS (User-owned listings)
// ============================================================================
const hostListingsDB = {
  // Create new host listing
  create(userId, listingData) {
    const id = Date.now().toString();
    const newListing = {
      id,
      ownerId: userId,
      ...listingData,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      inquiries: 0
    };
    hostListings.push(newListing);
    return newListing;
  },
  
  // Get all listings for a host
  getByUserId(userId) {
    return hostListings.filter(l => l.ownerId === userId);
  },
  
  // Get specific host listing by ID
  getById(id) {
    return hostListings.find(l => l.id === id);
  },
  
  // Update host listing
  update(id, updates) {
    const listing = hostListings.find(l => l.id === id);
    if (listing) {
      Object.assign(listing, updates, { updatedAt: new Date().toISOString() });
    }
    return listing;
  },
  
  // Update listing status (live, paused, sold, etc.)
  updateStatus(id, status) {
    const listing = hostListings.find(l => l.id === id);
    if (listing) {
      listing.status = status;
      listing.updatedAt = new Date().toISOString();
    }
    return listing;
  },
  
  // Delete host listing
  delete(id) {
    const index = hostListings.findIndex(l => l.id === id);
    if (index !== -1) {
      hostListings.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Get all listings (admin view)
  getAll() {
    return hostListings;
  }
};

// ============================================================================
// BOOKING & INQUIRY MANAGEMENT
// ============================================================================
const bookingsDB = {
  // Create new booking/inquiry
  create(listingId, userId, bookingData) {
    const id = Date.now().toString();
    const newBooking = {
      id,
      listingId,
      userId,
      ...bookingData,
      status: 'pending', // pending, confirmed, cancelled, completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    
    // Increment inquiry count on listing
    const listing = hostListingsDB.getById(listingId);
    if (listing) {
      listing.inquiries = (listing.inquiries || 0) + 1;
    }
    
    return newBooking;
  },
  
  // Get booking by ID
  getById(id) {
    return bookings.find(b => b.id === id);
  },
  
  // Get all bookings for a user
  getByUserId(userId) {
    return bookings.filter(b => b.userId === userId);
  },
  
  // Get all bookings for a listing (for host)
  getByListingId(listingId) {
    return bookings.filter(b => b.listingId === listingId);
  },
  
  // Update booking status
  updateStatus(id, status) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      booking.updatedAt = new Date().toISOString();
    }
    return booking;
  },
  
  // Get all bookings (admin view)
  getAll() {
    return bookings;
  }
};

// ============================================================================
// INQUIRIES (General inquiries/requests)
// ============================================================================
const inquiriesDB = {
  // Create new inquiry
  create(listingId, userId, inquiryData) {
    const id = Date.now().toString();
    const newInquiry = {
      id,
      listingId,
      userId,
      ...inquiryData,
      status: 'open', // open, responded, closed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inquiries.push(newInquiry);
    return newInquiry;
  },
  
  // Get inquiry by ID
  getById(id) {
    return inquiries.find(i => i.id === id);
  },
  
  // Get all inquiries for a user
  getByUserId(userId) {
    return inquiries.filter(i => i.userId === userId);
  },
  
  // Get all inquiries for a listing
  getByListingId(listingId) {
    return inquiries.filter(i => i.listingId === listingId);
  },
  
  // Update inquiry
  update(id, updates) {
    const inquiry = inquiries.find(i => i.id === id);
    if (inquiry) {
      Object.assign(inquiry, updates, { updatedAt: new Date().toISOString() });
    }
    return inquiry;
  },
  
  // Get all inquiries (admin view)
  getAll() {
    return inquiries;
  }
};

// ============================================================================
// EVENT REQUESTS
// ============================================================================
const eventRequestsDB = {
  // Create new event request
  create(userId, eventData) {
    const id = Date.now().toString();
    const newRequest = {
      id,
      userId,
      ...eventData,
      status: 'pending', // pending, confirmed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    eventRequests.push(newRequest);
    return newRequest;
  },
  
  // Get event request by ID
  getById(id) {
    return eventRequests.find(r => r.id === id);
  },
  
  // Get all requests for a user
  getByUserId(userId) {
    return eventRequests.filter(r => r.userId === userId);
  },
  
  // Update event request status
  updateStatus(id, status) {
    const request = eventRequests.find(r => r.id === id);
    if (request) {
      request.status = status;
      request.updatedAt = new Date().toISOString();
    }
    return request;
  },
  
  // Get all requests (admin view)
  getAll() {
    return eventRequests;
  }
};

// ============================================================================
// MAIN EXPORTS
// ============================================================================
module.exports = {
  // User management
  users: userDB,
  
  // Auth token management
  auth: authDB,
  
  // Public listings
  listings: listingsDB,
  
  // Host listings
  host: hostListingsDB,
  
  // Bookings (for rent/sale purchases)
  bookings: bookingsDB,
  
  // Inquiries (general messages)
  inquiries: inquiriesDB,
  
  // Event requests (for event professionals)
  events: eventRequestsDB,
  
  // Backward compatibility - direct access
  getListings: () => listingsDB.getAll(),
  getListingById: (id) => listingsDB.getById(id),
  addUser: (user) => userDB.addUser(user),
  getUserByEmail: (email) => userDB.getUserByEmail(email),
  getUserById: (id) => userDB.getUserById(id),
  storeToken: (token, userId) => authDB.storeToken(token, userId),
  getUserIdFromToken: (token) => authDB.getUserIdFromToken(token)
};
