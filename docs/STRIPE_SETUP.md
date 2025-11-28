# Stripe Integration Setup

Use this guide to configure the Stripe CLI, VS Code extension, and Vercel environment for Vendibook. Everything below assumes **TEST mode**.

---

## 1. Install & Authenticate
1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) (`brew install stripe/stripe-cli/stripe` on macOS).
2. Run `stripe login` and open the browser link to authorize your machine.
3. Confirm your login at any time with:
   ```bash
   stripe status
   ```
   This command verifies auth, API connectivity, and webhook forwarding state.
4. Install the [Stripe VS Code extension](https://marketplace.visualstudio.com/items?itemName=Stripe.vscode-stripe). Open `.vscode/stripe.code-workspace` to expose the Stripe sidebar, API object explorer, and webhook quick commands already configured for this repo.

## 2. Inspect Test Data Quickly
List the most recent test customers to confirm you are in the correct account:
```bash
stripe customers list --limit 5
```
Any data you see here is safe to delete because it lives in the isolated Stripe **test** dataset.

## 3. Forward Webhooks Locally
Stripe CLI generates a unique signing secret each time you start a listener. Run this command in a dedicated terminal window and keep it running:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`. The CLI will now forward events for checkout sessions, payment intents, and any custom flows.

## 4. Test Card Numbers
Stripe provides deterministic card numbers for QA:
- **Visa (happy path):** `4242 4242 4242 4242`
- **3D Secure challenge:** `4000 0025 0000 3155`
- **Insufficient funds:** `4000 0000 0000 9995`
Use any future expiration date, any CVC, and any ZIP/Postal code.

## 5. Test Mode vs Live Mode
- **Test mode:** Keys look like `sk_test_...` and `pk_test_...`. All payments are simulated. Never ship these keys to production.
- **Live mode:** Keys look like `sk_live_...` and `pk_live_...`. Funds move for real users. Only set these inside Vercel after QA is complete.
Toggle between the two in the Stripe Dashboard sidebar. Make sure the CLI, VS Code extension, and dashboard are all using the same mode before running checkouts.

## 6. Locate API Keys
1. Visit the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Toggle **Viewing test data** in the upper-left to ensure you stay in test mode.
3. Go to **Developers → API keys** and copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
4. Webhook secrets live under **Developers → Webhooks**. For local work, prefer the key printed by `stripe listen` because it rotates automatically.

## 7. Required Environment Variables
Add the following in **Vercel → Settings → Environment Variables**. Do **not** commit any secrets.
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Mirror the same values in `.env.local` for local development. Restart `npm run dev` after editing env files so Vite reloads the variables.

## 8. Glossary
- **Checkout Session:** Server-side object that drives Stripe Checkout (line items, URLs, metadata). Returns a hosted URL for redirect-based payments.
- **PaymentIntent:** Tracks the lifecycle of a single payment attempt (authorization, capture, failure states). Checkout Sessions create one automatically when `mode: 'payment'`.
- **Webhook:** Signed HTTPS callback from Stripe that confirms payment state. Always verify signatures (`STRIPE_WEBHOOK_SECRET`) before trusting payloads.

## 9. Recommended Local Workflow
1. `npm run dev` — start the Vite frontend.
2. `stripe status` — confirm the CLI is still logged in.
3. `stripe listen --forward-to localhost:3000/api/stripe/webhook` — capture live events locally.
4. Use `startCheckout` (see `src/utils/stripeClient.js`) to initiate a payment from the UI.
5. Watch the CLI terminal for webhook confirmations, then inspect the same events inside the Stripe Dashboard.

Following these steps keeps every developer aligned when testing the Vendibook + Stripe integration.
