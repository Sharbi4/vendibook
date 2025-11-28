# Stripe Integration Setup

Use this guide to configure the Stripe CLI, VS Code extension, and Vercel environment for Vendibook. All instructions assume **TEST mode**.

## 1. Prerequisites
- Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and log in with `stripe login`.
- Install the [Stripe VS Code extension](https://marketplace.visualstudio.com/items?itemName=Stripe.vscode-stripe).
- Ensure you have access to the Vendibook Stripe dashboard (test mode).

## 2. Verify Stripe CLI Login
```bash
stripe status
```
- Confirms authentication, API connectivity, and webhook forwarding status.

## 3. Inspect Test Data
View existing test customers:
```bash
stripe customers list --limit 5
```
Use this to quickly inspect profiles generated during QA flows.

## 4. Forward Webhooks Locally
Run the listener in a dedicated terminal:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
- Leave this running while testing checkout flows.
- Copy the signing secret that the CLI prints and place it in `STRIPE_WEBHOOK_SECRET`.

## 5. Test Card Numbers
Use Stripe default cards when checking out:
- Visa (standard auth): `4242 4242 4242 4242`
- 3D Secure required: `4000 0025 0000 3155`
- Insufficient funds: `4000 0000 0000 9995`
Each card accepts any future expiry, any CVC, and any ZIP.

## 6. Test Mode vs Live Mode
- **Test Mode:** All operations are simulated. Keys start with `sk_test_` and `pk_test_`. Only use these in development and staging. Data is isolated from production and can be safely cleared.
- **Live Mode:** Real payments. Keys start with `sk_live_` and `pk_live_`. Never use live mode locally. Production deploys must set live keys via Vercel.
Switch modes in the Stripe Dashboard using the toggle in the left sidebar. Ensure the CLI and VS Code extension match the intended mode.

## 7. Locating API Keys
1. Visit the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Toggle **Viewing test data** (upper-left) to stay in test mode.
3. Navigate to **Developers → API keys**.
4. Copy the **Secret key** (`STRIPE_SECRET_KEY`) and **Publishable key** (`VITE_STRIPE_PUBLISHABLE_KEY`).
5. Under **Developers → Webhooks**, you can regenerate live signing secrets. For local work, prefer the CLI-generated secret noted above.

## 8. Required Environment Variables (Vercel)
Set the following in Vercel:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Add these under **Vercel → Settings → Environment Variables**. Do not commit these keys.
For local development, mirror the same variables in your `.env.local` file (never push secrets to Git).

## 9. Glossary
- **Checkout Session:** Server-created object that powers Stripe Checkout. It ties together the customer, line items, success/cancel URLs, and post-payment state.
- **PaymentIntent:** Tracks the lifecycle of a payment attempt, including authentication and settlement. Checkout Sessions create a PaymentIntent under the hood when `mode = "payment"`.
- **Webhook:** Server endpoint that receives signed JSON payloads from Stripe. Webhooks confirm payment status and trigger post-payment workflows. Always validate the signature before trusting the payload.

## 10. Recommended Workflow
1. Start your local dev server (Vite/Next).
2. Run the Stripe webhook listener.
3. Trigger a checkout via the frontend helper.
4. Observe CLI logs, verify webhook receipts, and confirm PaymentIntent state in the dashboard.

Following this checklist ensures every developer shares the same Stripe testing workflow.
