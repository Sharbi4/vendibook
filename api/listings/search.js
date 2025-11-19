/**
 * GET /api/listings/search
 * Advanced search with sorting and filtering
 */

const { searchListingsSchema } = require('../../validation');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    const { method } = req;

    // GET - Advanced search with query parameters
    if (method === 'GET') {
      const {
        q = '',
        type,
        category,
        city,
        minPrice,
        maxPrice,
        verified,
        delivery,
        sort = 'newest',
        page = 1,
        limit = 20
      } = req.query;

      try {
        // Build database filter
        const where = {};

        if (q) {
          // Search by title, description, and tags
          where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { tags: { hasSome: [q.toLowerCase()] } }
          ];
        }

        if (type) {
          where.listingType = type;
        }

        if (category) {
          where.category = category;
        }

        if (city) {
          where.city = { contains: city, mode: 'insensitive' };
        }

        if (minPrice !== undefined) {
          where.price = { ...(where.price || {}), gte: parseFloat(minPrice) };
        }

        if (maxPrice !== undefined) {
          where.price = { ...(where.price || {}), lte: parseFloat(maxPrice) };
        }

        if (verified === 'true') {
          where.isVerified = true;
        }

        if (delivery === 'true') {
          where.deliveryAvailable = true;
        }

        // Build order by
        let orderBy = { createdAt: 'desc' };

        switch (sort) {
          case 'price-low':
            orderBy = { price: 'asc' };
            break;
          case 'price-high':
            orderBy = { price: 'desc' };
            break;
          case 'rating':
            orderBy = { rating: 'desc' };
            break;
          case 'views':
            orderBy = { views: 'desc' };
            break;
          case 'newest':
          default:
            orderBy = { createdAt: 'desc' };
        }

        // Get results with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [listings, total] = await Promise.all([
          db.prisma.hostListing.findMany({
            where,
            orderBy,
            skip,
            take: parseInt(limit),
            include: {
              owner: { select: { name: true, avatarUrl: true } }
            }
          }),
          db.prisma.hostListing.count({ where })
        ]);

        return res.status(200).json({
          data: listings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    // POST - Alternative interface with validation
    if (method === 'POST') {
      const { sort = 'newest', page = 1, limit = 20, ...filters } = req.body;

      // Validate input
      const validation = searchListingsSchema.safeParse(filters);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const searchData = validation.data;

      // Build database filter
      const where = {};

      if (searchData.q) {
        where.OR = [
          { title: { contains: searchData.q, mode: 'insensitive' } },
          { description: { contains: searchData.q, mode: 'insensitive' } }
        ];
      }

      if (searchData.listingType) {
        where.listingType = searchData.listingType;
      }

      if (searchData.category) {
        where.category = searchData.category;
      }

      if (searchData.location) {
        where.city = { contains: searchData.location, mode: 'insensitive' };
      }

      if (searchData.minPrice !== undefined || searchData.maxPrice !== undefined) {
        where.price = {};
        if (searchData.minPrice !== undefined) {
          where.price.gte = searchData.minPrice;
        }
        if (searchData.maxPrice !== undefined) {
          where.price.lte = searchData.maxPrice;
        }
      }

      // Build order by
      let orderBy = { createdAt: 'desc' };
      switch (sort) {
        case 'price-low':
          orderBy = { price: 'asc' };
          break;
        case 'price-high':
          orderBy = { price: 'desc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
        case 'views':
          orderBy = { views: 'desc' };
          break;
      }

      // Execute search
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [listings, total] = await Promise.all([
        db.prisma.hostListing.findMany({
          where,
          orderBy,
          skip,
          take: parseInt(limit)
        }),
        db.prisma.hostListing.count({ where })
      ]);

      return res.status(200).json({
        data: listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
