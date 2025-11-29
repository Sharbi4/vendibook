# Stripe Identity Verification + Clerk Authentication Setup Guide

## Overview

This guide explains how to set up the complete Clerk authentication + Stripe Identity verification flow for Vendibook. After signing in with Clerk, users are redirected to their dashboard in a restricted "locked" mode until they complete Stripe Identity verification.

## Architecture

```
1. User signs in → Clerk authenticates → Redirect to /dashboard
2. Dashboard loads in "locked" mode (IdentityVerificationGate)
3. User clicks "Verify to Access Full Account"
4. API creates Stripe Identity verification session
5. User redirected to Stripe for ID + selfie + liveness check
6. Stripe webhook notifies our backend of verification status
7. Backend updates user record: identityVerified = true
8. User returns to /verify-success page
9. Dashboard unlocks all features
```

## Prerequisites

- Clerk account and project
- Stripe account with Identity enabled
- Node.js 18+ and npm

## Environment Variables

Create or update your `env.local` file with the following variables:

```bash
# ====================
# CLERK CONFIGURATION
# ====================
# Get these from: https://dashboard.clerk.com/
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Clerk Frontend API (legacy)
VITE_CLERK_FRONTEND_API=clerk.your-domain.lcl.dev

# ====================
# STRIPE CONFIGURATION
# ====================
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook signing secret (get after creating webhook endpoint)
# From: https://dashboard.stripe.com/webhooks
STRIPE_IDENTITY_WEBHOOK_SECRET=whsec_...

# ====================
# APPLICATION
# ====================
# Your app URL (for Stripe return URLs)
VITE_APP_URL=http://localhost:5173

# For production:
# VITE_APP_URL=https://vendibook.com
```

## Step 1: Configure Clerk

### 1.1 Create Clerk Application

1. Go to https://dashboard.clerk.com/
2. Create a new application or use existing
3. Copy your **Publishable Key** and **Secret Key**
4. Add them to `env.local`

### 1.2 Configure Clerk Redirects

In Clerk Dashboard → **Settings** → **Paths**:

- **Sign-in redirect**: `/dashboard`
- **Sign-up redirect**: `/dashboard`
- **After sign-out**: `/`

### 1.3 Enable User Metadata

In Clerk Dashboard → **Customize** → **Metadata**:

Enable **Public Metadata** to store verification status:
```json
{
  "identityVerified": false,
  "stripeVerificationStatus": "none",
  "stripeVerificationSessionId": null,
  "stripeVerifiedAt": null
}
```

## Step 2: Configure Stripe Identity

### 2.1 Enable Stripe Identity

1. Go to https://dashboard.stripe.com/
2. Navigate to **More** → **Identity**
3. Click **Enable Identity**
4. Complete the setup wizard

### 2.2 Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **Local development**: Use ngrok or similar tunnel
     ```bash
     ngrok http 5173
     # Use: https://your-url.ngrok.io/api/identity/webhook
     ```
   - **Production**: `https://vendibook.com/api/identity/webhook`

4. Select events to listen to:
   - ✅ `identity.verification_session.verified`
   - ✅ `identity.verification_session.requires_input`
   - ✅ `identity.verification_session.canceled`
   - ✅ `identity.verification_session.processing`

5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `env.local` as `STRIPE_IDENTITY_WEBHOOK_SECRET`

### 2.3 Configure Verification Settings

In Stripe Dashboard → **Identity** → **Settings**:

- **Verification type**: Document
- **Allowed documents**:
  - ✅ Driver's license
  - ✅ Passport
  - ✅ ID card
- **Liveness check**: ✅ Enabled
- **Face matching**: ✅ Enabled

## Step 3: Deploy Backend APIs

The following API endpoints are already created:

### 3.1 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/identity/status` | GET | Get current user's verification status |
| `/api/identity/create-session` | POST | Create Stripe Identity verification session |
| `/api/identity/webhook` | POST | Handle Stripe Identity webhooks |

### 3.2 Vercel Deployment (Recommended)

If using Vercel, the API routes in `/api` folder will automatically be deployed as serverless functions.

**vercel.json** (already configured):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 3.3 Testing Locally

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Set up ngrok for webhooks:
   ```bash
   ngrok http 5173
   ```

3. Update Stripe webhook URL to your ngrok URL

## Step 4: User Flow Testing

### 4.1 Test New User Sign Up

1. Go to `http://localhost:5173/signup`
2. Create a new account
3. Verify you're redirected to `/dashboard`
4. Confirm you see the **"Verify to Access Full Account"** banner

### 4.2 Test Identity Verification

1. Click **"Verify to Access Full Account"**
2. Verify API creates session and redirects to Stripe
3. Complete verification flow:
   - Upload ID document
   - Take selfie
   - Complete liveness check
4. Verify you're redirected to `/verify-success`
5. Confirm dashboard is now unlocked

### 4.3 Test Webhook Processing

Monitor webhook events in Stripe Dashboard:

1. Go to https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. View **Recent deliveries**
4. Confirm events are being received and processed

### 4.4 Test Failed Verification

1. Start verification with invalid document
2. Confirm you see "requires_input" status
3. Verify "Retry Verification" button appears
4. Test retry flow

## Step 5: Protected Features

The following pages/features are protected by `IdentityVerificationGate`:

| Feature | Page/Component | Locked Until Verified |
|---------|---------------|----------------------|
| Host Dashboard | `/host/dashboard` | ✅ Yes |
| Create Listing | `/host/onboarding` | ✅ Yes |
| Listing Creation Wizard | `/host/listings/create` | ✅ Yes |
| Host Bookings | `/host/bookings` | Optional |
| Messaging | `/messages` | Optional |
| Payouts | Future | ✅ Yes |

### Adding Verification Gate to New Pages

Wrap any component with `IdentityVerificationGate`:

```jsx
import IdentityVerificationGate from '../components/IdentityVerificationGate';

function MyProtectedPage() {
  return (
    <IdentityVerificationGate requireVerification={true}>
      {/* Your protected content here */}
      <div>This requires verification</div>
    </IdentityVerificationGate>
  );
}
```

## Step 6: Database Schema

User records include the following verification fields:

```javascript
{
  id: "user_123",
  clerkId: "user_clerk_123",
  email: "user@example.com",
  name: "John Doe",

  // Identity verification fields
  identityVerified: false,                    // Boolean
  stripeVerificationStatus: "none",           // none | pending | processing | verified | requires_input | canceled
  stripeVerificationSessionID: null,          // Stripe session ID
  stripeVerifiedAt: null,                     // ISO timestamp

  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z"
}
```

## Step 7: Security Best Practices

### 7.1 Token Verification

All API endpoints verify Clerk session tokens:

```javascript
const authHeader = req.headers.authorization;
const token = authHeader.substring(7); // Remove "Bearer "
const sessionToken = await clerk.sessions.verifyToken(token);
```

### 7.2 Webhook Signature Verification

Stripe webhooks verify signatures to prevent tampering:

```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
```

### 7.3 Access Control

Frontend components check verification status before allowing actions:

```javascript
const { identityVerified } = await fetchVerificationStatus();
if (!identityVerified) {
  // Show locked state
}
```

## Step 8: Production Deployment

### 8.1 Environment Variables

Set environment variables in your hosting platform:

**Vercel**:
```bash
vercel env add CLERK_SECRET_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_IDENTITY_WEBHOOK_SECRET
```

**Netlify**:
Go to **Site settings** → **Environment variables**

### 8.2 Update URLs

Update `VITE_APP_URL` to your production domain:
```bash
VITE_APP_URL=https://vendibook.com
```

### 8.3 Update Stripe Webhook

Update webhook endpoint URL in Stripe Dashboard:
```
https://vendibook.com/api/identity/webhook
```

### 8.4 Update Clerk Redirects

Update Clerk redirect URLs to production domain.

## Troubleshooting

### Issue: "Authentication required" error

**Solution**: Ensure user is signed in with Clerk and session token is valid.

```bash
# Check Clerk session in browser console:
await window.Clerk.session.getToken()
```

### Issue: Webhook not receiving events

**Solutions**:
1. Verify webhook URL is accessible (test with curl)
2. Check webhook signing secret matches
3. Monitor Stripe Dashboard → Webhooks → Recent deliveries
4. Check server logs for errors

### Issue: Verification session creation fails

**Solutions**:
1. Verify Stripe Identity is enabled in dashboard
2. Check `STRIPE_SECRET_KEY` is correct
3. Ensure API key has Identity permissions
4. Check server logs for detailed error

### Issue: User stuck in "pending" state

**Solutions**:
1. Check webhook is receiving events
2. Verify webhook handler is processing correctly
3. Check database for user record updates
4. Test webhook manually using Stripe CLI:
   ```bash
   stripe trigger identity.verification_session.verified
   ```

### Issue: Frontend not showing updated status

**Solutions**:
1. Refresh user data: `await user.reload()`
2. Clear browser cache
3. Check API response in Network tab
4. Verify Clerk metadata is being updated

## API Reference

### GET /api/identity/status

Get current user's verification status.

**Headers**:
```
Authorization: Bearer <clerk-session-token>
```

**Response**:
```json
{
  "identityVerified": false,
  "stripeVerificationStatus": "none",
  "stripeVerificationSessionID": null,
  "stripeVerifiedAt": null
}
```

### POST /api/identity/create-session

Create a new Stripe Identity verification session.

**Headers**:
```
Authorization: Bearer <clerk-session-token>
```

**Response**:
```json
{
  "sessionId": "vs_1234...",
  "url": "https://verify.stripe.com/start/...",
  "status": "created",
  "message": "Verification session created successfully."
}
```

### POST /api/identity/webhook

Stripe webhook endpoint (internal use only).

**Headers**:
```
stripe-signature: t=...,v1=...
```

**Body**: Stripe webhook event

## Support

For issues or questions:

1. Check this documentation
2. Review Stripe Dashboard logs
3. Check Clerk Dashboard logs
4. Review browser console for errors
5. Check server logs for API errors

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Identity Documentation](https://stripe.com/docs/identity)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**Last Updated**: November 29, 2025
**Version**: 1.0.0
