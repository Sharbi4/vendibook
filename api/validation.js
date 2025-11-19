/**
 * Input Validation Schemas using Zod
 * 
 * These schemas validate all API inputs before processing
 * Provides consistent error messages and type safety
 */

const { z } = require('zod');

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

const emailSchema = z.string().email('Invalid email format').toLowerCase();

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[!@#$%^&*]/, 'Password must contain special character');

const stringId = z.string().cuid('Invalid ID format');

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required')
});

// ============================================================================
// LISTING SCHEMAS
// ============================================================================

const listingTypeSchema = z.enum(['RENT', 'SALE', 'EVENT_PRO']);
const bookingTypeSchema = z.enum(['RENTAL_REQUEST', 'EVENT_REQUEST', 'PURCHASE_INQUIRY']);
const listingStatusSchema = z.enum(['DRAFT', 'LIVE', 'PAUSED', 'SOLD', 'ARCHIVED']);

const createHostListingSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long'),
  
  listingType: listingTypeSchema,
  
  category: z.string()
    .min(1, 'Category required')
    .max(50, 'Category too long'),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City too long'),
  
  state: z.string()
    .length(2, 'State must be 2 characters')
    .uppercase(),
  
  price: z.number()
    .positive('Price must be greater than 0')
    .max(1000000, 'Price too high'),
  
  priceUnit: z.string()
    .refine(
      val => ['per day', 'per hour', 'one-time'].includes(val),
      'Invalid price unit'
    ),
  
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  imageUrls: z.array(z.string().url('Invalid image URL')).optional(),
  
  tags: z.array(z.string()).optional().default([]),
  highlights: z.array(z.string()).optional().default([]),
  
  deliveryAvailable: z.boolean().optional().default(false),
  isVerified: z.boolean().optional().default(false)
});

const updateHostListingSchema = createHostListingSchema.partial();

const updateListingStatusSchema = z.object({
  status: listingStatusSchema
});

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

const searchListingsSchema = z.object({
  listingType: listingTypeSchema.optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  deliveryOnly: z.boolean().optional(),
  verifiedOnly: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'rating']).optional()
});

const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

// ============================================================================
// BOOKING & INQUIRY SCHEMAS
// ============================================================================

const createBookingSchema = z.object({
  bookingType: bookingTypeSchema,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventDate: z.string().datetime().optional(),
  guestCount: z.number().int().positive().optional(),
  message: z.string().max(2000).optional(),
  price: z.number().nonnegative().optional(),
  priceUnit: z.string().optional()
}).refine(
  (data) => {
    if (data.bookingType === 'RENTAL_REQUEST') {
      return data.startDate && data.endDate;
    }
    if (data.bookingType === 'EVENT_REQUEST') {
      return data.eventDate;
    }
    return true;
  },
  { message: 'Missing required fields for booking type' }
);

const createInquirySchema = z.object({
  inquiryType: z.enum(['PRICE_INQUIRY', 'CONDITION_INQUIRY', 'AVAILABILITY_INQUIRY', 'GENERAL_INQUIRY']),
  message: z.string()
    .min(5, 'Message must be at least 5 characters')
    .max(2000, 'Message too long'),
  price: z.number().optional()
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DECLINED', 'COMPLETED', 'CANCELLED'])
});

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

const createReviewSchema = z.object({
  rating: z.number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  
  comment: z.string()
    .max(2000, 'Comment too long')
    .optional()
});

// ============================================================================
// USER UPDATE SCHEMAS
// ============================================================================

const updateUserProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .optional(),
  
  phoneNumber: z.string().optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: passwordSchema
});

// ============================================================================
// VALIDATION HELPER
// ============================================================================

/**
 * Validate input against schema
 * @param {object} data - Data to validate
 * @param {ZodSchema} schema - Zod schema
 * @param {object} res - Response object (optional, for error response)
 * @returns {object|null} - Validated data or null if invalid (error sent)
 */
function validateInput(data, schema, res = null) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (res) {
      const errors = error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Validators
  validateInput,

  // Auth schemas
  registerSchema,
  loginSchema,
  refreshTokenSchema,

  // Listing schemas
  createHostListingSchema,
  updateHostListingSchema,
  updateListingStatusSchema,
  searchListingsSchema,

  // Booking schemas
  createBookingSchema,
  createInquirySchema,
  updateBookingStatusSchema,

  // Review schemas
  createReviewSchema,

  // User schemas
  updateUserProfileSchema,
  changePasswordSchema,

  // Common
  paginationSchema,
  listingTypeSchema,
  listingStatusSchema
};
