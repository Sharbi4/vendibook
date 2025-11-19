/**
 * Analytics Service
 * Provides methods to calculate analytics for hosts and listings
 */

const db = require('./db');

const analyticsService = {
  /**
   * Get host overview analytics
   */
  async getHostOverview(userId) {
    try {
      // Get host's listings
      const listings = await db.host.getByUserId(userId);
      const listingIds = listings.map(l => l.id);

      // Calculate metrics
      const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
      const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiries || 0), 0);

      // Get bookings
      const bookings = await db.prisma.booking.findMany({
        where: { listing: { ownerId: userId } }
      });

      const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
      const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
      const totalEarnings = bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.price || 0), 0);

      // Get reviews
      const reviews = await db.prisma.review.findMany({
        where: { hostListing: { ownerId: userId } }
      });

      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      return {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'LIVE').length,
        totalViews,
        totalInquiries,
        totalBookings: bookings.length,
        completedBookings,
        pendingBookings,
        conversionRate: bookings.length > 0
          ? ((completedBookings / bookings.length) * 100).toFixed(1)
          : 0,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        avgRating: parseFloat(avgRating),
        reviewCount: reviews.length,
        responseRate: 100 // TODO: Calculate actual response time
      };
    } catch (error) {
      console.error('Error calculating host overview:', error);
      throw error;
    }
  },

  /**
   * Get listing-specific analytics
   */
  async getListingAnalytics(listingId) {
    try {
      const listing = await db.host.getById(listingId);

      if (!listing) {
        throw new Error('Listing not found');
      }

      // Get listing data
      const views = listing.views || 0;
      const inquiries = listing.inquiries || 0;

      // Get bookings for this listing
      const bookings = await db.prisma.booking.findMany({
        where: { listingId }
      });

      const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
      const totalBookings = bookings.length;
      const totalEarnings = bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.price || 0), 0);

      // Get reviews
      const reviews = await db.prisma.review.findMany({
        where: { hostListingId: listingId }
      });

      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      // Calculate conversion rate
      const conversionRate = views > 0
        ? ((totalBookings / views) * 100).toFixed(1)
        : 0;

      return {
        listingId,
        title: listing.title,
        views,
        inquiries,
        bookings: totalBookings,
        completedBookings,
        conversionRate: parseFloat(conversionRate),
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        avgRating: parseFloat(avgRating),
        reviewCount: reviews.length,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error calculating listing analytics:', error);
      throw error;
    }
  },

  /**
   * Get renter booking analytics
   */
  async getRenterBookingAnalytics(userId) {
    try {
      const bookings = await db.bookings.getByUserId(userId);

      const completed = bookings.filter(b => b.status === 'COMPLETED').length;
      const pending = bookings.filter(b => b.status === 'PENDING').length;
      const approved = bookings.filter(b => b.status === 'APPROVED').length;
      const declined = bookings.filter(b => b.status === 'DECLINED').length;

      const totalSpent = bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.price || 0), 0);

      return {
        totalBookings: bookings.length,
        completed,
        pending,
        approved,
        declined,
        totalSpent: parseFloat(totalSpent.toFixed(2))
      };
    } catch (error) {
      console.error('Error calculating renter analytics:', error);
      throw error;
    }
  },

  /**
   * Get platform-wide analytics (admin)
   */
  async getPlatformAnalytics() {
    try {
      const [
        totalUsers,
        totalListings,
        totalBookings,
        totalReviews
      ] = await Promise.all([
        db.prisma.user.count(),
        db.prisma.hostListing.count(),
        db.prisma.booking.count(),
        db.prisma.review.count()
      ]);

      const completedBookings = await db.prisma.booking.count({
        where: { status: 'COMPLETED' }
      });

      const totalEarnings = await db.prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { price: true }
      });

      const avgRating = await db.prisma.review.aggregate({
        _avg: { rating: true }
      });

      return {
        totalUsers,
        activeHosts: await db.prisma.user.count({
          where: { role: 'HOST' }
        }),
        totalListings,
        liveListings: await db.prisma.hostListing.count({
          where: { status: 'LIVE' }
        }),
        totalBookings,
        completedBookings,
        conversionRate: totalBookings > 0
          ? ((completedBookings / totalBookings) * 100).toFixed(1)
          : 0,
        totalEarnings: parseFloat((totalEarnings._sum.price || 0).toFixed(2)),
        avgRating: parseFloat((avgRating._avg.rating || 0).toFixed(1)),
        totalReviews
      };
    } catch (error) {
      console.error('Error calculating platform analytics:', error);
      throw error;
    }
  }
};

module.exports = analyticsService;
