# Vendibook - PHASE 3 Installation & Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (local or managed service like AWS RDS, Railway, Supabase)
- AWS Account (for S3 file storage) or similar cloud storage service
- Git

## Environment Setup

### 1. Database Configuration

**Option A: Pull Environment Variables from Vercel (Recommended for Team)**

If you have access to the Vercel project, you can pull all environment variables automatically:

```bash
npm run env:pull
```

This command will:
- Authenticate with Vercel (first time only)
- Pull all environment variables from the Vercel project
- Create a `.env.development.local` file with all necessary configuration

**Option B: Manual Configuration**

Create a `.env.local` file in the project root with:

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://username:password@localhost:5432/vendibook_dev"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRY="7d"

# AWS S3 Configuration (for image uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="vendibook-images"
AWS_S3_URL="https://vendibook-images.s3.amazonaws.com"

# Frontend API Base URL
REACT_APP_API_URL="http://localhost:3000"

# Email Configuration (optional, for future notifications)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@vendibook.com"
```

### 2. Install Dependencies

```bash
npm install

# Install Prisma dependencies
npm install @prisma/client
npm install -D prisma

# Install authentication libraries
npm install jsonwebtoken
npm install bcrypt

# Install validation library
npm install zod

# Install AWS SDK
npm install @aws-sdk/client-s3

# Install additional middleware
npm install cors
npm install dotenv
npm install express-rate-limit
```

### 3. Set Up Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create initial migration (first time setup)
npx prisma migrate dev --name init

# Open Prisma Studio to view data
npx prisma studio
```

### 4. Database Setup Instructions

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb vendibook_dev

# Connect string for .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/vendibook_dev"
```

#### Option B: Managed Service (Recommended for Production)

- **Supabase** (PostgreSQL as a service): https://supabase.com
- **Railway** (PostgreSQL hosting): https://railway.app
- **AWS RDS**: PostgreSQL managed database
- **PlanetScale** (MySQL): https://planetscale.com

### 5. AWS S3 Setup for Image Uploads

1. Create an AWS account or use existing one
2. Create an S3 bucket named "vendibook-images"
3. Configure bucket policy for public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::vendibook-images/*"
    }
  ]
}
```

4. Create IAM user with S3 access
5. Add credentials to `.env.local`

Alternatively, use:
- **Cloudinary**: https://cloudinary.com (easier setup)
- **Firebase Storage**: https://firebase.google.com
- **Vercel Blob**: https://vercel.com/docs/storage/vercel-blob

### 6. Run Development Server

```bash
# Start Vite frontend dev server
npm run dev

# In another terminal, start API server (if using Node.js backend)
node api/server.js

# Or use Vercel dev server
vercel dev
```

## Database Schema Overview

The Prisma schema includes:

1. **User Model** - Authentication, profile, roles
2. **Listing Model** - Public marketplace listings
3. **HostListing Model** - User-created listings with ownership
4. **Booking Model** - Rental and event requests
5. **Inquiry Model** - Messages for SALE listings
6. **EventRequest Model** - Event professional booking requests
7. **Review Model** - Ratings and comments
8. **ImageAsset Model** - File metadata
9. **AuditLog Model** - Track user actions
10. **Notification Model** - User notifications
11. **StatusLog Model** - Listing status history

## Migration Guide from Mock Data

### Seed Initial Data

Create `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'HOST'
    }
  });

  // Create sample listings
  const listings = await prisma.hostListing.createMany({
    data: [
      {
        ownerId: user.id,
        title: 'Fully Equipped Taco Truck',
        description: 'Professional taco truck...',
        listingType: 'RENT',
        category: 'food-trucks',
        city: 'Tucson',
        state: 'AZ',
        location: 'Tucson, AZ',
        price: 250,
        priceUnit: 'per day',
        isVerified: true,
        deliveryAvailable: true
      }
      // ... more listings
    ]
  });

  console.log('✅ Seeded database successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Run seed:
```bash
npx prisma db seed
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings/search` - Search listings

### Host Listings
- `GET /api/host/listings` - Get user's listings
- `POST /api/host/listings` - Create new listing
- `PUT /api/host/listings/:id` - Update listing
- `PUT /api/host/listings/:id/status` - Update listing status
- `DELETE /api/host/listings/:id` - Delete listing

### Bookings & Inquiries
- `POST /api/listings/:id` - Create booking/inquiry/event request
- `GET /api/bookings` - Get user's bookings
- `PUT /api/bookings/:id` - Update booking status

### Uploads
- `POST /api/host/upload` - Get signed S3 upload URL
- `POST /api/host/upload/confirm` - Confirm file upload

## Testing the System

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Test User"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 3. Create Listing (with token)
```bash
curl -X POST http://localhost:3000/api/host/listings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My Food Truck",
    "description":"Professional food truck rental",
    "listingType":"RENT",
    "category":"food-trucks",
    "city":"Tucson",
    "state":"AZ",
    "price":250,
    "priceUnit":"per day"
  }'
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
vercel deploy
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Railway/Render Deployment

1. Connect GitHub repository
2. Set environment variables
3. Railway/Render will auto-detect and deploy

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check Prisma connection
npx prisma db push --skip-generate
```

### Migration Issues
```bash
# Reset database (WARNING: destroys data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run build
```

## Next Steps

- Implement JWT token refresh mechanism
- Add email verification
- Implement password reset flow
- Add two-factor authentication
- Set up monitoring and logging
- Implement rate limiting
- Add search indexing (Elasticsearch/Algolia)

## Support & Documentation

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
- AWS S3 Docs: https://docs.aws.amazon.com/s3
- JWT Tokens: https://jwt.io
