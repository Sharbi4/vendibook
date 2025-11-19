# Vendibook Backend & Workflow Audit - Analysis Phase

## Executive Summary
This document captures the findings from a deep audit of Vendibook's backend infrastructure, domain model, and core workflows. The analysis identifies critical gaps, missing endpoints, and needed schema extensions to support the complete business model.

---

## SECTION ONE: DOMAIN MODEL AUDIT

### Current State Analysis
The Prisma schema contains most necessary entities but with some gaps and inconsistencies:

**Entities Present:**
- ✅ User (with roles: USER, HOST, ADMIN)
- ✅ HostListing (with status: DRAFT, LIVE, PAUSED, SOLD, ARCHIVED)
- ✅ Booking (with status: PENDING, APPROVED, DECLINED, COMPLETED, CANCELLED)
- ✅ Inquiry (for sale listings)
- ✅ EventRequest (for event pro services)
- ✅ Review & Rating
- ✅ MessageThread & Message
- ✅ Notification
- ✅ AuditLog & StatusLog
- ✅ ImageAsset
- ✅ Wishlist & RecentlyViewed

**Critical Gaps Identified:**

| Gap | Impact | Status |
|-----|--------|--------|
| No Document/Permits model | Can't track insurance, waivers, permits | CRITICAL |
| No Subscription model | Can't implement Renter Pro | CRITICAL |
| No Transaction/Payment model | Can't track commissions, refunds, payouts | CRITICAL |
| No Asset entity (physical asset backing) | Asset lifecycle unclear | MEDIUM |
| Missing location masking fields | Address exposed before booking | CRITICAL |
| No multi-listing booking support | Can't bundle truck + lot listings | CRITICAL |
| Missing booking dates for EVENT_PRO | Event bookings lack time bounds | MEDIUM |
| No delivery address model | Delivery logistics not tracked | MEDIUM |
| User profile incomplete | Missing seller-specific fields | MEDIUM |
| No event professional specialization | Event pros not differentiated | MEDIUM |

### Recommended Schema Extensions

#### 1. Document Model (Critical)
```prisma
model Document {
  id              String    @id @default(cuid())
  
  // Document metadata
  type            DocumentType  // INSURANCE, PERMIT, TITLE, WAIVER, AGREEMENT, LICENSE
  category        String        // e.g., "liability_insurance", "business_license"
  status          DocumentStatus @default(PENDING) // PENDING, VERIFIED, REJECTED, EXPIRED
  
  // Relationships
  userId          String?
  user            User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  listingId       String?
  listing         HostListing? @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  bookingId       String?
  booking         Booking? @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  
  // File storage
  fileUrl         String
  fileKey         String  @unique  // S3 key
  mimeType        String
  fileSize        Int
  
  // Verification
  uploadedBy      String
  verifiedBy      String?
  verifiedAt      DateTime?
  expiresAt       DateTime?
  
  metadata        Json?  // Custom metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([listingId])
  @@index([bookingId])
  @@index([type])
  @@index([status])
}

enum DocumentType {
  INSURANCE
  PERMIT
  TITLE
  WAIVER
  AGREEMENT
  LICENSE
  INSPECTION
  OTHER
}

enum DocumentStatus {
  PENDING
  VERIFIED
  REJECTED
  EXPIRED
}
```

#### 2. Subscription Model (Critical)
```prisma
model Subscription {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  planType        SubscriptionType  // RENTER_PRO, HOST_STANDARD, HOST_PREMIUM, etc
  status          SubscriptionStatus @default(ACTIVE
  
  // Pricing
  pricePerMonth   Float
  billingCycle    Int  // Days
  
  // Duration
  startDate       DateTime
  endDate         DateTime?
  autoRenew       Boolean @default(true)
  
  // Discounts
  discountPercent Float @default(0)
  couponCode      String?
  
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([planType])
  @@index([status])
}

enum SubscriptionType {
  RENTER_PRO      // Reduces renter fees
  HOST_STANDARD   // Basic host tools
  HOST_PREMIUM    // Advanced features
  ADMIN_PLATFORM  // Platform management
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAUSED
  EXPIRED
}
```

#### 3. Transaction/Payment Model (Critical)
```prisma
model Transaction {
  id              String    @id @default(cuid())
  
  // Transaction metadata
  type            TransactionType  // BOOKING_PAYMENT, REFUND, PAYOUT, COMMISSION, FEE
  status          TransactionStatus @default(PENDING)
  
  // Parties
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Related entity
  bookingId       String?
  booking         Booking? @relation(fields: [bookingId], references: [id])
  
  listingId       String?
  listing         HostListing? @relation(fields: [listingId], references: [id])
  
  // Amount
  amount          Float
  currency        String @default("USD")
  platformFee     Float @default(0)
  commission      Float @default(0)
  netAmount       Float
  
  // Payment method
  paymentMethod   String?  // card, bank_transfer, wallet, etc
  paymentIntentId String?  // Stripe PI ID
  
  // Refund tracking
  refundAmount    Float @default(0)
  refundReason    String?
  
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  processedAt     DateTime?
  
  @@index([userId])
  @@index([bookingId])
  @@index([listingId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

enum TransactionType {
  BOOKING_PAYMENT
  REFUND
  PAYOUT
  COMMISSION
  PLATFORM_FEE
  SUBSCRIPTION_CHARGE
}

enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

#### 4. Enhanced Booking Model - Additional Fields
**Add to Booking model:**
```prisma
// Pricing breakdown
subtotal        Float?
platformFee     Float?
discount        Float?
totalPrice      Float?

// Delivery
deliveryAddress String?  // Full address for confirmed bookings
deliveryDate    DateTime?
pickupAddress   String?

// Confirmation
hostConfirmedAt  DateTime?
renterConfirmedAt DateTime?

// Condition/Return
returnCondition String?   // PRISTINE, GOOD, FAIR, POOR
returnPhotos    String[]

// Multi-listing support
bundleId        String?  // Group related bookings
parentBookingId String?  // For linked bookings
linkedBookings  String[]

// Event details  
eventTime       DateTime?  // Time window for EVENT_PRO
eventLocation   String?
eventDescription String?

// References
documentsRequired String[]
documentsProvided Document[]

// Chat/messaging
threadId        String?
thread          MessageThread? @relation(fields: [threadId], references: [id])

transactions    Transaction[]
```

#### 5. Enhanced User Profile - Location Masking
**Add to User model:**
```prisma
// Address masking for hosts
displayCity     String?    // What renters see
displayState    String?
displayLocation String?

preciseAddress  String?    // Exact address - admin only
coordinates     Json?      // { lat, lng } - admin only

// Professional info (for hosts/event pros)
businessName    String?
businessLicense String?
insuranceStatus String?  // VERIFIED, PENDING, EXPIRED
serviceAreas    String[]  // Service radius cities

// Event Pro specialization
eventProCategories String[]  // CHEF, BARTENDER, DJ, CATERER, etc
eventProRating  Float @default(0)
eventProReviews Int @default(0)

// Seller specific
sellerVerified  Boolean @default(false)
titleVerified   Boolean @default(false)
remoteNotaryUsed Boolean @default(false)
```

---

## SECTION TWO: CORE WORKFLOWS AUDIT

### Workflow 1: Rental Booking Flow

**Current State:** PARTIAL - Basic bookings supported

| Step | Current API | Status | Issues |
|------|------------|--------|--------|
| 1. Search rentals | `GET /api/listings` | ✅ Works | Needs address masking |
| 2. View listing details | `GET /api/listings/:id` | ✅ Works | Missing availability calendar |
| 3. Create booking request | `POST /api/listings/:id` | ❓ Unclear | Uses listing endpoint, not booking |
| 4. Host notification | N/A | ❌ Missing | No notification trigger |
| 5. Approve/decline booking | `/api/host/bookings/[id]/status.js` | ✅ Exists | Needs proper implementation |
| 6. Capture payment | N/A | ❌ Missing | No transaction creation |
| 7. Update dashboard | Mock data | ⚠️ Frontend only | Needs real data |
| 8. Confirm return | N/A | ❌ Missing | No return condition tracking |
| 9. Finalize payout | N/A | ❌ Missing | No payout logic |
| 10. Review/rating | Review model exists | ✅ Present | Endpoint missing |

**Missing Endpoints for Rental Booking:**
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/confirm-return` - Confirm return condition
- `GET /api/bookings/:id/availability` - Check available dates
- `POST /api/reviews` - Create review
- `PATCH /api/bookings/:id/accept` - Host accepts booking
- `PATCH /api/bookings/:id/decline` - Host declines booking

### Workflow 2: For-Sale Equipment Flow

**Current State:** PARTIAL - Inquiry model exists but workflow incomplete

| Step | Current API | Status | Issues |
|------|------------|--------|--------|
| 1. Create for-sale listing | `POST /api/host/listings` | ✅ Works | Type=SALE |
| 2. Upload photos | `POST /api/host/upload` | ✅ Works | Limited to single image |
| 3. Set price/delivery | HostListing model | ✅ Works | Delivery terms unclear |
| 4. Buyer sends inquiry | `/api/listings/:id` (unclear) | ❓ Unclear | Not clear it's an inquiry |
| 5. System creates transaction | Transaction model needed | ❌ Missing | No payment tracking |
| 6. Title verification | Document model needed | ❌ Missing | No permit tracking |
| 7. Delivery setup | Booking fields exist | ⚠️ Partial | Needs fuller model |
| 8. Mark completed | Booking status transition | ✅ Possible | Not documented |

**Missing Endpoints for Sale Flow:**
- `POST /api/inquiries` - Create inquiry for sale item
- `GET /api/inquiries` - Get inquiries (for seller)
- `PATCH /api/inquiries/:id/respond` - Respond to inquiry
- `POST /api/inquiries/:id/accept` - Accept purchase request
- `POST /api/transactions` - Create transaction record
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/documents` - Upload title/permit documents

### Workflow 3: Event Pro Booking Flow

**Current State:** PARTIAL - EventRequest model exists

| Step | Current API | Status | Issues |
|------|------------|--------|--------|
| 1. Search event pros | `GET /api/listings?type=EVENT_PRO` | ✅ Works | Needs calendar/availability |
| 2. View details | `GET /api/listings/:id` | ✅ Works | Missing pro details |
| 3. Submit request | EventRequest model | ✅ Exists | POST endpoint missing |
| 4. Notify event pro | N/A | ❌ Missing | No notification |
| 5. Accept/decline | EventRequest enum | ✅ Possible | Endpoint missing |
| 6. Confirmed booking | EventRequest -> APPROVED | ✅ Possible | Workflow unclear |
| 7. Payment capture | N/A | ❌ Missing | No transaction |
| 8. Rating | Review model | ✅ Exists | Endpoint missing |

**Missing Endpoints for Event Pro:**
- `POST /api/event-requests` - Create event request
- `GET /api/event-requests` - Get requests (for pro or renter)
- `PATCH /api/event-requests/:id/accept` - Accept event request
- `PATCH /api/event-requests/:id/decline` - Decline request
- `GET /api/event-pros` - Search with filtering
- `GET /api/event-pros/:id/availability` - Calendar availability

### Workflow 4: Multi-Listing Bundle Flow

**Current State:** NOT SUPPORTED

**Issue:** Renter wants to book both a food truck (from Host A) AND a vending lot (from Host B) for the same time window. Currently system can only create separate bookings.

**Solution Options:**
1. Create Bundle/Order entity grouping multiple bookings
2. Add bundleId/parentBookingId to Booking model
3. Create "Package" entity combining listings

**Recommendation:** Use bundleId approach (simpler, already in schema suggestion)

**Missing Endpoints:**
- `POST /api/bookings/bundle` - Create multiple linked bookings
- `GET /api/bookings?bundleId=:id` - Get bundle bookings

### Workflow 5: Compliance & Documents Flow

**Current State:** NOT SUPPORTED - No Document model

**Required Steps:**
1. Host uploads insurance certificate
2. Host uploads business permit
3. For sales: seller provides title documents
4. Platform verifies documents (admin)
5. Documents attached to bookings/listings
6. Renters can download verified docs after booking

**Missing Model:** Document (as suggested above)

**Missing Endpoints:**
- `POST /api/documents` - Upload document
- `GET /api/documents` - Get my documents
- `GET /api/documents/:id` - Get document details
- `PATCH /api/documents/:id/verify` - Admin verify
- `DELETE /api/documents/:id` - Delete document
- `GET /api/listings/:id/required-documents` - Get required docs

---

## SECTION THREE: API SURFACE AUDIT

### Current API Endpoints by Category

**Auth Endpoints (3 total):**
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/login`
- ✅ `GET /api/auth/me`

**Listings Endpoints (4 total):**
- ✅ `GET /api/listings` - List all with filters
- ✅ `GET /api/listings/:id` - Get single listing
- ✅ `POST /api/listings/search` - Search endpoint
- ❓ `POST /api/listings/:id` - Create request (unclear)

**Host Listings (4 total):**
- ✅ `GET /api/host/listings` - Get my listings
- ✅ `POST /api/host/listings` - Create listing
- ✅ `GET /api/host/listings/:id` - Get single (implied)
- ✅ `PATCH /api/host/listings/:id/status` - Update status
- ❓ `PUT /api/host/listings/:id` - Update listing (partial)

**Bookings Endpoints (5 total):**
- ✅ `GET /api/bookings` - Get my bookings (renter)
- ❌ `POST /api/bookings` - Create booking - **MISSING**
- ❌ `GET /api/bookings/:id` - Get booking - **MISSING**
- ✅ `GET /api/host/bookings` - Get host's bookings
- ✅ `PATCH /api/host/bookings/:id/status` - Update booking

**Messages Endpoints (3 total):**
- ✅ `GET /api/messages/threads` - Get threads
- ✅ `GET /api/messages/:threadId` - Get thread messages
- ✅ `POST /api/messages/:threadId` - Create message (implied)

**Notifications Endpoints (2 total):**
- ✅ `GET /api/notifications` - Get notifications
- ✅ `POST /api/notifications/read` - Mark read

**Admin Endpoints (3 total):**
- ✅ `GET /api/admin/listings` - List all listings
- ✅ `PATCH /api/admin/listings/:id` - Suspend/reinstate listing
- ✅ `GET /api/admin/users` - List users
- ✅ `GET /api/admin/bookings` - List bookings

**Upload Endpoints (1 total):**
- ✅ `POST /api/host/upload` - Upload image

**Analytics Endpoints (2 total):**
- ✅ `GET /api/analytics/host/overview` - Host dashboard
- ✅ `GET /api/analytics/host/listing/:id` - Listing analytics

**Wishlist Endpoints (1 total):**
- ✅ `POST /api/wishlist` - Add to wishlist

**Total Endpoints: ~30**

### Critical Missing Endpoints

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/bookings` | POST | Create booking request | CRITICAL |
| `/api/bookings/:id` | GET | Get booking details | CRITICAL |
| `/api/bookings/:id` | PATCH | Update booking | CRITICAL |
| `/api/bookings/:id/status` | PATCH | Change status | CRITICAL |
| `/api/inquiries` | POST | Create inquiry (for sale) | HIGH |
| `/api/inquiries` | GET | List inquiries | HIGH |
| `/api/inquiries/:id/accept` | PATCH | Accept inquiry | HIGH |
| `/api/documents` | POST | Upload document | HIGH |
| `/api/documents` | GET | List my documents | HIGH |
| `/api/documents/:id/verify` | PATCH | Admin verify | HIGH |
| `/api/subscriptions` | GET | Get subscription | MEDIUM |
| `/api/subscriptions` | POST | Create subscription | MEDIUM |
| `/api/transactions` | GET | Get transactions | MEDIUM |
| `/api/reviews` | POST | Create review | MEDIUM |
| `/api/reviews` | GET | List reviews | MEDIUM |
| `/api/listings/:id/availability` | GET | Check available dates | MEDIUM |

---

## SECTION FOUR: Authentication & Authorization Audit

### Current State: PARTIAL

**What Exists:**
- ✅ JWT token generation and validation
- ✅ Password hashing with bcrypt
- ✅ `requireAuth` middleware
- ✅ User roles (USER, HOST, ADMIN)
- ✅ Auth endpoints (register, login, me)

**What's Missing:**
- ❌ Role-based access control (RBAC) enforcement
- ❌ No @relation for subscriptions/roles on User
- ❌ No endpoint-level role checking
- ❌ No refresh token support
- ❌ No email verification
- ❌ No password reset
- ❌ No account suspension/deactivation
- ❌ No 2FA support

### Required RBAC Rules

**Host-Only Operations:**
- Create/update/delete listings
- View booking requests for own listings
- Access host dashboard/analytics
- Upload documents
- Create subscriptions

**Renter-Only Operations:**
- Create bookings
- View own bookings
- Create reviews
- Add to wishlist

**Event Pro-Only Operations:**
- Create event service listings
- Respond to event requests
- View event calendar

**Admin-Only Operations:**
- Access admin dashboard
- Verify documents
- Suspend/reinstate listings
- Manage users
- View all transactions

### Recommended Additions

```javascript
// Middleware for role-based checks
async function requireHost(req, res) {
  const user = await requireAuth(req);
  if (!user || user.role !== 'HOST') {
    return res.status(403).json({ error: 'Forbidden: Host access required' });
  }
  return user;
}

async function requireAdmin(req, res) {
  const user = await requireAuth(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  return user;
}
```

---

## SECTION FIVE: Frontend-Backend Contract Audit

### Function-by-Function Review

| Function | Backend Route | Status | Notes |
|----------|--------------|--------|-------|
| `fetchListings()` | `GET /api/listings` | ✅ Match | Works well |
| `fetchListingById()` | `GET /api/listings/:id` | ✅ Match | Works well |
| `searchListings()` | `POST /api/listings/search` | ✅ Match | Works well |
| `createHostListing()` | `POST /api/host/listings` | ✅ Match | Works well |
| `fetchHostListings()` | `GET /api/host/listings` | ✅ Match | Works well |
| `updateHostListing()` | `PUT /api/host/listings/:id` | ❌ NO ENDPOINT | Missing |
| `updateHostListingStatus()` | `PATCH /api/host/listings/:id/status` | ✅ Match | Works well |
| `uploadImage()` | `POST /api/host/upload` | ✅ Match | Works well |
| `register()` | `POST /api/auth/register` | ✅ Match | Works well |
| `login()` | `POST /api/auth/login` | ✅ Match | Works well |
| `getCurrentUser()` | `GET /api/auth/me` | ✅ Match | Works well |
| `apiClient.get/post/put/delete()` | All endpoints | ✅ Generic | Works well |

### Issues Found

1. **updateHostListing()** - Calls `PUT /api/host/listings/:id` but endpoint doesn't exist
   - Should create full update endpoint

2. **Frontend Phase 4 pages** - Using mock data
   - `/messages` - Works with mock
   - `/notifications` - Works with mock
   - `/bookings` - Works with mock
   - `/host/bookings` - Works with mock
   - `/analytics` - Works with mock
   - `/admin` - Works with mock
   - All fallback gracefully to mock data when API calls fail

---

## SECTION SIX: Data Integrity & Schema Audit

### Foreign Key Relationships - Status

✅ **Properly Constrained:**
- Booking.userId → User.id
- Booking.listingId → HostListing.id
- HostListing.ownerId → User.id
- Message.senderId/recipientId → User.id
- MessageThread.participants → User[]
- Inquiry.userId/listingId → User/HostListing
- EventRequest relationships → User/HostListing

❌ **Missing/Weak:**
- No cascade on critical soft-deletes
- No Booking → Document link
- No Booking → Transaction link
- No Booking → MessageThread auto-link

### Index Coverage - Status

✅ **Well Indexed:**
- User: email, createdAt
- HostListing: ownerId, status, city, createdAt
- Booking: userId, listingId, status, createdAt
- Message: threadId, senderId, recipientId, createdAt
- Notification: userId, read, createdAt

⚠️ **Could Improve:**
- Booking: Missing index on (listingId, startDate) for availability queries
- HostListing: Missing composite (city, status, category) for search
- Message: Missing (threadId, createdAt) for pagination

### Soft Delete Strategy

Currently: **No soft deletes implemented**

**Recommendation:** Add soft delete fields to:
- HostListing - `deletedAt DateTime?`
- User - `deletedAt DateTime?`
- Document - `deletedAt DateTime?`

---

## SECTION SEVEN: Error Handling & Response Standardization

### Current State: INCONSISTENT

**Examples of inconsistency:**

```javascript
// Some endpoints:
res.status(400).json({ error: 'Bad request' })

// Others:
res.status(400).json({ message: 'Bad request' })

// Some:
return res.status(200).json({ success: true, data: { ... } })

// Others:
return res.status(200).json({ listings: [...] })
```

### Recommended Standard Response Format

```javascript
// Success (2xx)
{
  success: true,
  code: "RESOURCE_CREATED",
  message: "Booking created successfully",
  data: { /* actual data */ },
  timestamp: "2025-01-19T10:30:00Z"
}

// Error (4xx/5xx)
{
  success: false,
  code: "VALIDATION_FAILED",
  message: "Required fields missing",
  errors: [
    {
      field: "startDate",
      message: "Start date is required",
      code: "REQUIRED"
    }
  ],
  timestamp: "2025-01-19T10:30:00Z"
}
```

### HTTP Status Code Mapping

| Status | Use Case | Example |
|--------|----------|---------|
| 200 | GET, successful update | Listing retrieved |
| 201 | Resource created | Booking created |
| 204 | No content | Soft delete |
| 400 | Validation error | Missing required field |
| 401 | Unauthenticated | No token provided |
| 403 | Unauthorized | Not your listing |
| 404 | Not found | Listing doesn't exist |
| 409 | Conflict | Slot already booked |
| 500 | Server error | Database connection failed |

---

## SECTION EIGHT: Security & Privacy - Address Masking

### Current State: NOT IMPLEMENTED

**Issue:** Exact trailer and lot addresses are sensitive. Should be hidden until booking confirmed.

### Required Fields on HostListing

**Public (visible in listings):**
- `city` - e.g., "Miami"
- `state` - e.g., "FL"  
- `displayLocation` - e.g., "Downtown Miami area" or "15 miles from airport"

**Private (admin/host only):**
- `preciseAddress` - Full street address
- `coordinates` - JSON { lat, lng }

**Release on Confirmation:**
- After booking.status = APPROVED:
  - Renter can see `preciseAddress`
  - Renter can see `coordinates`

### Implementation Strategy

1. **Add fields to HostListing:**
   ```prisma
   displayLocation String? // What renters see
   preciseAddress  String? // Exact address
   coordinates     Json?   // { lat, lng }
   ```

2. **Modify listing response:**
   ```javascript
   // Public listing response (GET /api/listings/:id)
   if (!user || user.id !== listing.ownerId) {
     // Don't include preciseAddress or coordinates
     delete listing.preciseAddress;
     delete listing.coordinates;
   }
   
   // After booking approved
   const booking = await getBooking(bookingId);
   if (booking.status === 'APPROVED' && booking.userId === user.id) {
     // Include precise details
   }
   ```

3. **Add endpoint for confirmed booking details:**
   ```javascript
   GET /api/bookings/:id/access-details  // Returns precise address
   ```

### Sensitive Fields Protection

**User Model - Don't expose in listings:**
- email
- phone
- passwordHash

**Use minimal view:**
```prisma
host: {
  select: {
    id: true,
    name: true,
    rating: true,
    avatarUrl: true
    // NOT email, phone, etc
  }
}
```

---

## SECTION NINE: Critical Missing Implementations

### Must-Have Endpoints (for core workflows)

**Tier 1 - Absolutely Critical:**
1. ❌ `POST /api/bookings` - Create booking
2. ❌ `POST /api/inquiries` - Create inquiry
3. ❌ `POST /api/documents` - Upload documents
4. ❌ `PUT /api/host/listings/:id` - Full listing update
5. ❌ `POST /api/reviews` - Create reviews

**Tier 2 - High Priority (within week):**
1. ❌ `PATCH /api/bookings/:id/accept` - Host accept booking
2. ❌ `PATCH /api/bookings/:id/decline` - Host decline booking
3. ❌ `GET /api/listings/:id/availability` - Date availability
4. ❌ `POST /api/documents/:id/verify` - Admin verification
5. ❌ `POST /api/subscriptions` - Subscription management

**Tier 3 - Medium Priority:**
1. ❌ Password reset flow
2. ❌ Email verification
3. ❌ Return condition tracking
4. ❌ Multi-listing bundles
5. ❌ Event pro calendar

---

## SECTION TEN: Summary of Required Actions

### Database Schema Changes (High Priority)
- [ ] Add Document model
- [ ] Add Transaction model
- [ ] Add Subscription model
- [ ] Add new fields to Booking
- [ ] Add location masking fields to HostListing
- [ ] Add professional fields to User

### New API Endpoints (Critical)
- [ ] POST /api/bookings
- [ ] POST /api/inquiries
- [ ] POST /api/documents
- [ ] PUT /api/host/listings/:id
- [ ] POST /api/reviews
- [ ] PATCH /api/bookings/:id/accept
- [ ] PATCH /api/bookings/:id/decline
- [ ] GET /api/listings/:id/availability

### Infrastructure Changes
- [ ] Standardize API responses
- [ ] Implement RBAC middleware
- [ ] Add input validation (Zod)
- [ ] Add address masking logic
- [ ] Email verification setup
- [ ] Error handling consistency

### Testing & Validation
- [ ] Test all critical workflows end-to-end
- [ ] Validate RBAC enforcement
- [ ] Test address masking
- [ ] Load test listing search

---

## Appendix: Questions Deferred to Later Phases

1. **Payment Integration** - Which provider (Stripe, Square)?
2. **Real-time Features** - WebSocket vs polling for messages?
3. **Mobile App** - iOS/Android or web-only for Phase 1?
4. **Insurance Verification** - How automated vs manual?
5. **Title Verification** - Which title service? Remote notary?
6. **Email Service** - SendGrid, AWS SES, or custom?
7. **Image Storage** - S3, Cloudinary, or local?
8. **Scalability** - Database replication strategy?
9. **Reporting** - Analytics, tax reporting for users?
10. **Disputes** - Dispute resolution workflow?

---

## Next Steps

1. **Implement Tier 1 endpoints** (bookings, inquiries, documents)
2. **Extend database schema** (Document, Transaction, Subscription models)
3. **Add RBAC middleware** to protect endpoints
4. **Implement address masking** for privacy
5. **Standardize API responses** across all endpoints
6. **Write comprehensive integration tests**
7. **Deploy and monitor critical paths**

**Estimated effort:** 2-3 weeks for core implementation, depending on team size and existing patterns.
