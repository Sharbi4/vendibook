/**
 * In-Memory Data Store for Vendibook API
 *
 * This module provides a simple in-memory database for prototyping.
 * In production, replace this with a real database (PostgreSQL, Supabase, etc.)
 *
 * To migrate to a real database:
 * 1. Replace these arrays with database queries
 * 2. Update all API endpoints to use the database client
 * 3. Add proper indexes and relationships
 * 4. Implement transaction support for complex operations
 */

// Initial listings data (seeded from src/data/listings.js)
const listings = [
  {
    id: '1',
    title: 'Fully Equipped Taco Truck - LA Style',
    listingType: 'RENT',
    category: 'food-trucks',
    city: 'Tucson',
    state: 'AZ',
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
    ],
    ownerId: 'host1',
    status: 'live',
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    title: 'Wood-Fired Pizza Trailer - Professional Setup',
    listingType: 'RENT',
    category: 'trailers',
    city: 'Phoenix',
    state: 'AZ',
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
    ],
    ownerId: 'host2',
    status: 'live',
    createdAt: new Date('2024-01-20').toISOString()
  },
  {
    id: '3',
    title: 'Premium Ghost Kitchen - 24/7 Access',
    listingType: 'RENT',
    category: 'ghost-kitchens',
    city: 'Tucson',
    state: 'AZ',
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
    ],
    ownerId: 'host3',
    status: 'live',
    createdAt: new Date('2024-02-01').toISOString()
  },
  {
    id: '4',
    title: 'Downtown Vending Location - High Traffic',
    listingType: 'RENT',
    category: 'vending-lots',
    city: 'Tempe',
    state: 'AZ',
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
    ],
    ownerId: 'host4',
    status: 'live',
    createdAt: new Date('2024-02-05').toISOString()
  },
  {
    id: '5',
    title: 'Award-Winning Chef - Mexican Cuisine',
    listingType: 'EVENT_PRO',
    category: 'chefs',
    city: 'Phoenix',
    state: 'AZ',
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
    ],
    ownerId: 'host5',
    status: 'live',
    createdAt: new Date('2024-02-10').toISOString()
  },
  {
    id: '6',
    title: 'Vintage Coffee Cart - Fully Restored',
    listingType: 'RENT',
    category: 'trailers',
    city: 'Scottsdale',
    state: 'AZ',
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
    ],
    ownerId: 'host6',
    status: 'live',
    createdAt: new Date('2024-02-15').toISOString()
  },
  {
    id: '7',
    title: '2022 Food Truck - Like New',
    listingType: 'SALE',
    category: 'for-sale',
    city: 'Phoenix',
    state: 'AZ',
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
    ],
    ownerId: 'host7',
    status: 'live',
    createdAt: new Date('2024-02-20').toISOString()
  },
  {
    id: '8',
    title: 'BBQ Smoker Trailer - Competition Ready',
    listingType: 'RENT',
    category: 'trailers',
    city: 'Mesa',
    state: 'AZ',
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
    ],
    ownerId: 'host8',
    status: 'live',
    createdAt: new Date('2024-02-25').toISOString()
  },
  {
    id: '9',
    title: 'Professional Caterer - Italian Cuisine',
    listingType: 'EVENT_PRO',
    category: 'caterers',
    city: 'Scottsdale',
    state: 'AZ',
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
    ],
    ownerId: 'host9',
    status: 'live',
    createdAt: new Date('2024-03-01').toISOString()
  },
  {
    id: '10',
    title: 'Craft Coffee Barista - Specialty Drinks',
    listingType: 'EVENT_PRO',
    category: 'baristas',
    city: 'Tempe',
    state: 'AZ',
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
    ],
    ownerId: 'host10',
    status: 'live',
    createdAt: new Date('2024-03-05').toISOString()
  },
  {
    id: '11',
    title: 'Commercial Kitchen Equipment Set',
    listingType: 'SALE',
    category: 'equipment',
    city: 'Phoenix',
    state: 'AZ',
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
    ],
    ownerId: 'host11',
    status: 'live',
    createdAt: new Date('2024-03-10').toISOString()
  },
  {
    id: '12',
    title: 'Event Staff Coordinator - Full Service',
    listingType: 'EVENT_PRO',
    category: 'event-staff',
    city: 'Mesa',
    state: 'AZ',
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
    ],
    ownerId: 'host12',
    status: 'live',
    createdAt: new Date('2024-03-15').toISOString()
  }
];

// Users (hosts and renters)
const users = [
  {
    id: 'host1',
    email: 'maria@example.com',
    password: 'password123', // In production, this would be properly hashed
    name: 'Maria Rodriguez',
    role: 'host',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'demo',
    email: 'demo@vendibook.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'host',
    createdAt: new Date('2024-01-01').toISOString()
  }
];

// Active sessions (token -> userId mapping)
const sessions = new Map();

// Host-created listings (separate from main listings)
const hostListings = [];

// Booking requests
const bookings = [];

// Sale inquiries
const inquiries = [];

// Event requests
const eventRequests = [];

/**
 * Database interface
 *
 * To migrate to a real database:
 * - Replace these methods with database queries
 * - Add connection pooling
 * - Implement proper error handling
 * - Add transactions where needed
 */
const db = {
  // Listings
  listings: {
    getAll: () => [...listings],
    getById: (id) => listings.find(l => l.id === id),
    search: (filters) => {
      return listings.filter(listing => {
        if (filters.listingType && filters.listingType !== 'all' && listing.listingType !== filters.listingType) {
          return false;
        }
        if (filters.category && filters.category !== 'all' && listing.category !== filters.category) {
          return false;
        }
        if (filters.location) {
          const searchLower = filters.location.toLowerCase();
          const locationMatch = listing.city.toLowerCase().includes(searchLower) ||
                               listing.state.toLowerCase().includes(searchLower);
          if (!locationMatch) return false;
        }
        if (filters.priceMin && listing.price < parseInt(filters.priceMin)) {
          return false;
        }
        if (filters.priceMax && listing.price > parseInt(filters.priceMax)) {
          return false;
        }
        if (filters.deliveryOnly && !listing.deliveryAvailable) {
          return false;
        }
        if (filters.verifiedOnly && !listing.isVerified) {
          return false;
        }
        if (filters.amenities && filters.amenities.length > 0) {
          const hasAllAmenities = filters.amenities.every(amenity =>
            listing.tags.some(tag => tag.toLowerCase().includes(amenity.toLowerCase()))
          );
          if (!hasAllAmenities) return false;
        }
        return true;
      });
    }
  },

  // Host listings
  hostListings: {
    getAll: () => [...hostListings],
    getByOwnerId: (ownerId) => hostListings.filter(l => l.ownerId === ownerId),
    getById: (id) => hostListings.find(l => l.id === id),
    create: (listing) => {
      const newListing = {
        ...listing,
        id: `host-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: listing.status || 'live'
      };
      hostListings.push(newListing);
      // Also add to main listings for search
      listings.push(newListing);
      return newListing;
    },
    update: (id, updates) => {
      const index = hostListings.findIndex(l => l.id === id);
      if (index === -1) return null;
      hostListings[index] = { ...hostListings[index], ...updates, updatedAt: new Date().toISOString() };
      // Update in main listings too
      const mainIndex = listings.findIndex(l => l.id === id);
      if (mainIndex !== -1) {
        listings[mainIndex] = { ...listings[mainIndex], ...updates, updatedAt: new Date().toISOString() };
      }
      return hostListings[index];
    },
    updateStatus: (id, status) => {
      return db.hostListings.update(id, { status });
    }
  },

  // Users
  users: {
    getAll: () => [...users],
    getById: (id) => users.find(u => u.id === id),
    getByEmail: (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
    create: (user) => {
      const newUser = {
        ...user,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      return newUser;
    }
  },

  // Sessions
  sessions: {
    create: (userId) => {
      const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
      sessions.set(token, userId);
      return token;
    },
    getUserId: (token) => {
      return sessions.get(token);
    },
    delete: (token) => {
      sessions.delete(token);
    }
  },

  // Bookings
  bookings: {
    create: (booking) => {
      const newBooking = {
        ...booking,
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      bookings.push(newBooking);
      return newBooking;
    },
    getAll: () => [...bookings]
  },

  // Inquiries
  inquiries: {
    create: (inquiry) => {
      const newInquiry = {
        ...inquiry,
        id: `inquiry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      inquiries.push(newInquiry);
      return newInquiry;
    },
    getAll: () => [...inquiries]
  },

  // Event requests
  eventRequests: {
    create: (request) => {
      const newRequest = {
        ...request,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      eventRequests.push(newRequest);
      return newRequest;
    },
    getAll: () => [...eventRequests]
  }
};

module.exports = db;
