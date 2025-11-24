const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

if (!clerkPublishableKey) {
  // eslint-disable-next-line no-console
  console.warn('VITE_CLERK_PUBLISHABLE_KEY is not defined. Clerk components will not work without it.');
}

export const clerkConfig = {
  publishableKey: clerkPublishableKey,
  afterSignInFallback: '/listings',
};

export const clerkPublishableKeyValue = clerkPublishableKey;
