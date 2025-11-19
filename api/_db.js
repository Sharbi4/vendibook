/**
 * In-memory data store for Vendibook API
 * This is a prototype implementation that can be replaced with a real database later
 * (e.g., Postgres, Supabase, MongoDB)
 */

// Mock listings based on src/data/listings.js
const initialListings = [
  {
    id: "1",
    title: "Food Truck - Tacos & Street Food",
    description: "Fully equipped food truck with commercial kitchen, seating for 20",
    listingType: "RENT",
    category: "FOOD_TRUCK",
    location: "Tucson, AZ",
    price: 250,
    priceUnit: "day",
    images: ["https://via.placeholder.com/800x500?text=Food+Truck"],
    amenities: ["Commercial Kitchen", "Seating Area", "POS System"],
    deliveryOnly: false,
    verifiedVendor: true,
    rating: 4.8,
    reviews: 24,
    owner: {
      name: "Juan Martinez",
      phone: "+1-520-555-0123",
      verified: true
    }
  },
  {
    id: "2",
    title: "Ice Cream Cart - Premium Setup",
    description: "Italian gelato cart with electric coolers and display case",
    listingType: "RENT",
    category: "ICE_CREAM_CART",
    location: "Phoenix, AZ",
    price: 150,
    priceUnit: "day",
    images: ["https://via.placeholder.com/800x500?text=Ice+Cream+Cart"],
    amenities: ["Electric Coolers", "Display Case", "Umbrella"],
    deliveryOnly: false,
    verifiedVendor: true,
    rating: 4.9,
    reviews: 18,
    owner: {
      name: "Maria Garcia",
      phone: "+1-602-555-0456",
      verified: true
    }
  },
  {
    id: "3",
    title: "Commercial Kitchen - Shared Space",
    description: "2,000 sq ft ghost kitchen with full equipment, cold storage, prep areas",
    listingType: "RENT",
    category: "GHOST_KITCHEN",
    location: "Denver, CO",
    price: 1500,
    priceUnit: "month",
    images: ["https://via.placeholder.com/800x500?text=Ghost+Kitchen"],
    amenities: ["Industrial Stove", "Walk-in Cooler", "Prep Tables", "Storage"],
    deliveryOnly: false,
    verifiedVendor: true,
    rating: 4.7,
    reviews: 12,
    owner: {
      name: "Restaurant Group LLC",
      phone: "+1-303-555-0789",
      verified: true
    }
  },
  {
    id: "4",
    title: "Vintage Airstream Trailer",
    description: "Classic Airstream converted for beverage service, fully restored",
    listingType: "RENT",
    category: "TRAILER",
    location: "Austin, TX",
    price: 500,
    priceUnit: "day",
    images: ["https://via.placeholder.com/800x500?text=Airstream+Trailer"],
    amenities: ["Vintage Look", "Fully Equipped", "Delivery Available"],
    deliveryOnly: true,
    verifiedVendor: false,
    rating: 4.6,
    reviews: 8,
    owner: {
      name: "Event Rentals Austin",
      phone: "+1-512-555-0321",
      verified: false
    }
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

module.exports = {
  // User management
  users,
  addUser(user) {
    users.push(user);
    return user;
  },
  getUserByEmail(email) {
    return users.find(u => u.email === email);
  },
  getUserById(id) {
    return users.find(u => u.id === id);
  },
  
  // Token management
  storeToken(token, userId) {
    tokenToUser.set(token, userId);
  },
  getUserIdFromToken(token) {
    return tokenToUser.get(token);
  },
  
  // Listings (public/marketplace)
  listings,
  getListings() {
    return listings;
  },
  getListingById(id) {
    return listings.find(l => l.id === id);
  },
  
  // Host listings (owned by specific hosts)
  hostListings,
  addHostListing(listing) {
    const id = Date.now().toString();
    const newListing = {
      id,
      ...listing,
      createdAt: new Date().toISOString(),
      status: "live"
    };
    hostListings.push(newListing);
    return newListing;
  },
  getHostListingsByUserId(userId) {
    return hostListings.filter(l => l.ownerId === userId);
  },
  getHostListingById(id) {
    return hostListings.find(l => l.id === id);
  },
  updateHostListing(id, updates) {
    const listing = hostListings.find(l => l.id === id);
    if (listing) {
      Object.assign(listing, updates, { updatedAt: new Date().toISOString() });
    }
    return listing;
  },
  
  // Bookings and inquiries
  bookings,
  addBooking(booking) {
    const id = Date.now().toString();
    const newBooking = { id, ...booking, createdAt: new Date().toISOString() };
    bookings.push(newBooking);
    return newBooking;
  },
  
  inquiries,
  addInquiry(inquiry) {
    const id = Date.now().toString();
    const newInquiry = { id, ...inquiry, createdAt: new Date().toISOString() };
    inquiries.push(newInquiry);
    return newInquiry;
  },
  
  eventRequests,
  addEventRequest(request) {
    const id = Date.now().toString();
    const newRequest = { id, ...request, createdAt: new Date().toISOString() };
    eventRequests.push(newRequest);
    return newRequest;
  }
};
