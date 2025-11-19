/**
 * Prisma Seed Script
 * 
 * Populates the database with initial test data
 * Run with: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Mock listings data from src/data/listings.js
const mockListings = [
  {
    title: 'Fully Equipped Taco Truck - LA Style',
    listingType: 'RENT',
    category: 'food-trucks',
    city: 'Tucson',
    state: 'AZ',
    location: 'Tucson, AZ',
    price: 250,
    priceUnit: 'per day',
    imageUrl: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
    description: 'Professional taco truck perfect for events, festivals, and daily operations. Fully equipped with commercial-grade appliances, fresh water system, and propane setup. Health department approved and ready to roll.',
    tags: ['Power', 'Water', 'Propane', 'Full Kitchen', 'Delivery Available'],
    highlights: [
      'Commercial kitchen with griddle, fryer, and prep stations',
      'Fresh water (40 gal) and grey water (50 gal) tanks',
      '100 lb propane system with dual tanks',
      'Point-of-sale system and WiFi ready',
      'Full health inspection documentation'
    ],
    isVerified: true,
    deliveryAvailable: true
  },
  {
    title: 'Wood-Fired Pizza Trailer - Professional Setup',
    listingType: 'RENT',
    category: 'trailers',
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 180,
    priceUnit: 'per day',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    description: 'Authentic wood-fired pizza trailer with Italian imported oven. Perfect for weddings, corporate events, and festivals. Produces 80-100 pizzas per service.',
    tags: ['Power', 'Water', 'Wood-fired Oven', 'Prep Station'],
    highlights: [
      'Authentic Italian wood-fired oven',
      'Reaches 900°F in 20 minutes',
      'Stainless steel prep stations',
      'Refrigerated ingredient storage',
      'Towable with standard vehicle'
    ],
    isVerified: true,
    deliveryAvailable: true
  },
  {
    title: 'Premium Ghost Kitchen - 24/7 Access',
    listingType: 'RENT',
    category: 'ghost-kitchens',
    city: 'Tucson',
    state: 'AZ',
    location: 'Tucson, AZ',
    price: 150,
    priceUnit: 'per day',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    description: 'Professional commercial kitchen space for delivery-only restaurant operations. Fully licensed and health department approved. Perfect for scaling your food business.',
    tags: ['Full Kitchen', 'Storage', '24/7 Access', 'Walk-in Cooler'],
    highlights: [
      '24/7 secure access with key card',
      'Walk-in cooler and freezer',
      'Commercial gas range and griddle',
      'Dry storage and prep areas',
      'High-speed internet and POS ready'
    ],
    isVerified: true,
    deliveryAvailable: false
  },
  {
    title: 'Award-Winning Chef - Mexican Cuisine',
    listingType: 'EVENT_PRO',
    category: 'chefs',
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 75,
    priceUnit: 'per hour',
    imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80',
    description: 'Professional chef specializing in authentic Mexican cuisine. Available for private events, catering, and menu development. Award-winning recipes and presentation.',
    tags: ['Certified', 'Catering License', 'Menu Planning', '10+ Years Exp'],
    highlights: [
      'ServSafe certified',
      'Catering license and insurance',
      'Custom menu development',
      'Authentic family recipes',
      'Available for tastings'
    ],
    isVerified: true,
    deliveryAvailable: false
  },
  {
    title: '2022 Food Truck - Like New',
    listingType: 'SALE',
    category: 'for-sale',
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 45000,
    priceUnit: 'one-time',
    imageUrl: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
    description: '2022 Chevrolet P30 food truck with only 8,500 miles. Fully equipped commercial kitchen. Ready for immediate operation. Clean title, full inspection available.',
    tags: ['Title Verified', 'Low Miles', 'Full Inspection', 'Financing Available'],
    highlights: [
      'Only 8,500 miles',
      'Full commercial kitchen',
      'Recent health inspection',
      'Clean title in hand',
      'Financing options available'
    ],
    isVerified: true,
    deliveryAvailable: true
  },
  {
    title: 'Professional Caterer - Italian Cuisine',
    listingType: 'EVENT_PRO',
    category: 'caterers',
    city: 'Scottsdale',
    state: 'AZ',
    location: 'Scottsdale, AZ',
    price: 65,
    priceUnit: 'per hour',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
    description: 'Full-service Italian catering for weddings, corporate events, and private parties. Custom menus, professional service staff, and complete event coordination.',
    tags: ['Full Service', 'Equipment Included', 'Menu Planning', 'Wine Pairing'],
    highlights: [
      'Custom Italian menus',
      'Professional service staff',
      'Equipment and rentals included',
      'Wine pairing expertise',
      'Event coordination available'
    ],
    isVerified: true,
    deliveryAvailable: false
  }
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create test users
  const users = [];
  const userEmails = [
    { email: 'host1@test.com', name: 'Maria Rodriguez', role: 'HOST' },
    { email: 'host2@test.com', name: 'Tony Napoli', role: 'HOST' },
    { email: 'renter@test.com', name: 'John Doe', role: 'USER' }
  ];

  console.log('👤 Creating test users...');
  for (const userData of userEmails) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        passwordHash: await bcrypt.hash('TestPassword123!', 10)
      }
    });
    users.push(user);
    console.log(`   ✓ ${userData.name} (${userData.email})`);
  }

  // Create host listings
  console.log('\n📋 Creating host listings...');
  const hostUser = users.find(u => u.email === 'host1@test.com');

  for (let i = 0; i < mockListings.length; i++) {
    const listingData = mockListings[i];
    const listing = await prisma.hostListing.upsert({
      where: { id: `listing_${i}` }, // For idempotency
      update: {},
      create: {
        ...listingData,
        ownerId: hostUser.id,
        status: 'LIVE'
      }
    });
    console.log(`   ✓ ${listing.title}`);
  }

  // Create a sample booking
  console.log('\n📅 Creating sample booking...');
  const renterUser = users.find(u => u.email === 'renter@test.com');
  const firstListing = await prisma.hostListing.findFirst({
    where: { ownerId: hostUser.id }
  });

  if (renterUser && firstListing) {
    const booking = await prisma.booking.create({
      data: {
        userId: renterUser.id,
        listingId: firstListing.id,
        bookingType: 'RENTAL_REQUEST',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        message: 'Interested in renting this for an event',
        status: 'PENDING',
        price: firstListing.price * 7
      }
    });
    console.log(`   ✓ Booking created (ID: ${booking.id})`);
  }

  // Create sample review
  console.log('\n⭐ Creating sample review...');
  if (renterUser && firstListing) {
    const review = await prisma.review.create({
      data: {
        userId: renterUser.id,
        listingId: firstListing.id,
        hostListingId: firstListing.id,
        rating: 5,
        comment: 'Excellent service, highly recommend!'
      }
    });
    console.log(`   ✓ Review created (${review.rating}/5 stars)`);
  }

  // Create audit log for tracking
  console.log('\n📝 Creating audit log entry...');
  const auditLog = await prisma.auditLog.create({
    data: {
      userId: hostUser.id,
      action: 'CREATE_LISTING',
      resource: 'listing',
      resourceId: firstListing?.id || 'unknown',
      listingId: firstListing?.id,
      changes: { action: 'Database seed - Initial listing creation' }
    }
  });
  console.log(`   ✓ Audit log created`);

  console.log('\n✅ Database seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • ${users.length} users created`);
  console.log(`   • ${mockListings.length} listings created`);
  console.log(`   • 1 booking created`);
  console.log(`   • 1 review created`);
  console.log(`   • 1 audit log entry created`);

  console.log('\n🔐 Test Credentials:');
  userEmails.forEach(userData => {
    console.log(`   • ${userData.email} / TestPassword123!`);
  });

  console.log('\n📱 Next Steps:');
  console.log('   1. npx prisma studio  # View data in Prisma Studio');
  console.log('   2. npm run dev         # Start development server');
  console.log('   3. curl http://localhost:3000/api/listings');
}

main()
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
