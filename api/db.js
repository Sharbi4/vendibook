/**
 * Database Client with Prisma
 * 
 * This module wraps Prisma Client to provide a consistent interface
 * that maintains compatibility with the in-memory version from Phase 2
 * while using a real persistent PostgreSQL database.
 * 
 * All methods follow this pattern:
 * - db.users.getById(id)
 * - db.listings.getAll()
 * - db.host.create(userId, data)
 * - db.bookings.getByUserId(userId)
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

// ============================================================================
// USER OPERATIONS
// ============================================================================

const users = {
  async create(userData) {
    return prisma.user.create({
      data: userData
    });
  },

  async getById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  },

  async getByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  async getAll(filters = {}) {
    return prisma.user.findMany({
      where: filters,
      include: {
        hostListings: { select: { id: true, title: true } }
      }
    });
  },

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data
    });
  },

  async delete(id) {
    return prisma.user.delete({
      where: { id }
    });
  },

  async getWithListings(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        hostListings: true,
        bookings: true
      }
    });
  }
};

// ============================================================================
// PUBLIC LISTINGS OPERATIONS
// ============================================================================

const listings = {
  async getAll(filters = {}) {
    return this.search(filters);
  },

  async getById(id) {
    return prisma.listing.findUnique({
      where: { id },
      include: {
        reviews: {
          select: { rating: true, comment: true, createdAt: true }
        }
      }
    });
  },

  async search(filters = {}) {
    const where = {};

    // Filter by listing type
    if (filters.listingType) {
      where.listingType = filters.listingType;
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    // Filter by location
    if (filters.location) {
      where.OR = [
        { city: { contains: filters.location, mode: 'insensitive' } },
        { state: { contains: filters.location, mode: 'insensitive' } },
        { location: { contains: filters.location, mode: 'insensitive' } }
      ];
    }

    // Filter by price range
    if (filters.priceMin) {
      where.price = { gte: parseFloat(filters.priceMin) };
    }
    if (filters.priceMax) {
      where.price = { ...where.price, lte: parseFloat(filters.priceMax) };
    }

    // Filter by delivery
    if (filters.deliveryOnly) {
      where.deliveryAvailable = true;
    }

    // Filter by verified only
    if (filters.verifiedOnly) {
      where.isVerified = true;
    }

    // Text search
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return prisma.listing.findMany({
      where,
      include: {
        reviews: { select: { rating: true } }
      },
      orderBy: filters.sortBy || { createdAt: 'desc' }
    });
  },

  async incrementViews(id) {
    return prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
  }
};

// ============================================================================
// HOST LISTINGS OPERATIONS (User-created listings)
// ============================================================================

const host = {
  async create(userId, listingData) {
    return prisma.hostListing.create({
      data: {
        ...listingData,
        ownerId: userId
      }
    });
  },

  async getByUserId(userId) {
    return prisma.hostListing.findMany({
      where: { ownerId: userId },
      include: {
        bookings: { select: { id: true, status: true } },
        inquiries: { select: { id: true, status: true } },
        events: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getById(id) {
    return prisma.hostListing.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        bookings: true,
        inquiries: true,
        events: true,
        reviews: true
      }
    });
  },

  async update(id, data) {
    return prisma.hostListing.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, name: true } }
      }
    });
  },

  async updateStatus(id, status) {
    // Create status log
    const listing = await prisma.hostListing.findUnique({
      where: { id },
      select: { status: true }
    });

    await prisma.statusLog.create({
      data: {
        listingId: id,
        fromStatus: listing?.status || 'UNKNOWN',
        toStatus: status
      }
    });

    return prisma.hostListing.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });
  },

  async delete(id) {
    return prisma.hostListing.delete({
      where: { id }
    });
  },

  async getAll(filters = {}) {
    return prisma.hostListing.findMany({
      where: filters,
      include: {
        owner: { select: { name: true, email: true } },
        bookings: { select: { id: true, status: true } }
      }
    });
  },

  async incrementViews(id) {
    return prisma.hostListing.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
  },

  async incrementInquiries(id) {
    return prisma.hostListing.update({
      where: { id },
      data: { inquiries: { increment: 1 } }
    });
  }
};

// ============================================================================
// BOOKING OPERATIONS
// ============================================================================

const bookings = {
  async create(userId, listingId, bookingData) {
    return prisma.booking.create({
      data: {
        ...bookingData,
        userId,
        listingId
      }
    });
  },

  async getById(id) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { title: true, price: true, priceUnit: true } }
      }
    });
  },

  async getByUserId(userId) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        listing: { select: { id: true, title: true, imageUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getByListingId(listingId) {
    return prisma.booking.findMany({
      where: { listingId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async updateStatus(id, status) {
    return prisma.booking.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });
  },

  async getAll(filters = {}) {
    return prisma.booking.findMany({
      where: filters,
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { title: true } }
      }
    });
  }
};

// ============================================================================
// INQUIRY OPERATIONS
// ============================================================================

const inquiries = {
  async create(userId, listingId, inquiryData) {
    return prisma.inquiry.create({
      data: {
        ...inquiryData,
        userId,
        listingId
      }
    });
  },

  async getById(id) {
    return prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { title: true } }
      }
    });
  },

  async getByUserId(userId) {
    return prisma.inquiry.findMany({
      where: { userId },
      include: {
        listing: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getByListingId(listingId) {
    return prisma.inquiry.findMany({
      where: { listingId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async update(id, data) {
    return prisma.inquiry.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, email: true } }
      }
    });
  }
};

// ============================================================================
// EVENT REQUEST OPERATIONS
// ============================================================================

const events = {
  async create(userId, listingId, eventData) {
    return prisma.eventRequest.create({
      data: {
        ...eventData,
        userId,
        listingId
      }
    });
  },

  async getById(id) {
    return prisma.eventRequest.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { title: true } }
      }
    });
  },

  async getByUserId(userId) {
    return prisma.eventRequest.findMany({
      where: { userId },
      include: {
        listing: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getByListingId(listingId) {
    return prisma.eventRequest.findMany({
      where: { listingId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async updateStatus(id, status) {
    return prisma.eventRequest.update({
      where: { id },
      data: { status }
    });
  }
};

// ============================================================================
// REVIEW OPERATIONS
// ============================================================================

const reviews = {
  async create(reviewData) {
    return prisma.review.create({
      data: reviewData
    });
  },

  async getByListingId(listingId) {
    return prisma.review.findMany({
      where: { listingId },
      include: {
        user: { select: { name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getByUserId(userId) {
    return prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
};

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

const auditLogs = {
  async create(userId, action, data) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: data.resource,
        resourceId: data.resourceId,
        listingId: data.listingId,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    });
  },

  async getByUserId(userId) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  },

  async getByListingId(listingId) {
    return prisma.auditLog.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' }
    });
  }
};

// ============================================================================
// IMAGE ASSET OPERATIONS
// ============================================================================

const imageAssets = {
  async create(assetData) {
    return prisma.imageAsset.create({
      data: assetData
    });
  },

  async getById(id) {
    return prisma.imageAsset.findUnique({
      where: { id }
    });
  },

  async getByKey(key) {
    return prisma.imageAsset.findUnique({
      where: { key }
    });
  },

  async delete(id) {
    return prisma.imageAsset.delete({
      where: { id }
    });
  }
};

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

const notifications = {
  async create(userId, notificationData) {
    return prisma.notification.create({
      data: {
        ...notificationData,
        userId
      }
    });
  },

  async getByUserId(userId, unreadOnly = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false })
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async markAsRead(id) {
    return prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() }
    });
  }
};

// ============================================================================
// MAIN EXPORT
// ============================================================================

module.exports = {
  // Prisma client for raw queries if needed
  prisma,

  // Collections
  users,
  listings,
  host,
  bookings,
  inquiries,
  events,
  reviews,
  auditLogs,
  imageAssets,
  notifications,

  // Helper functions
  async disconnect() {
    await prisma.$disconnect();
  }
};
