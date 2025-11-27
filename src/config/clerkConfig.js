// To run locally (I will do this):
// npm install @clerk/clerk-react @clerk/clerk-js

export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
export const clerkFrontendApi = import.meta.env.VITE_CLERK_FRONTEND_API || undefined;

if (!clerkPublishableKey) {
  // eslint-disable-next-line no-console
  console.warn('[Clerk] VITE_CLERK_PUBLISHABLE_KEY is missing. Auth will be disabled until you add it.');
}
