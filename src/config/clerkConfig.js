const primaryPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const legacyPublishableKey =
  import.meta.env.CLERK_PUBLISHABLE_KEY ?? import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export const clerkPublishableKey = (primaryPublishableKey || legacyPublishableKey)?.trim();

export const clerkFrontendApi =
  (import.meta.env.VITE_CLERK_FRONTEND_API ?? import.meta.env.CLERK_FRONTEND_API)?.trim() ||
  undefined;

if (!clerkPublishableKey) {
  console.error(
    '❌ Clerk publishable key is missing — check your .env.local and Vercel environment variables.',
  );
} else {
  const masked = clerkPublishableKey.slice(0, 6);
  if (!primaryPublishableKey && legacyPublishableKey) {
    console.warn(
      '⚠️ Using legacy Clerk env var (CLERK_PUBLISHABLE_KEY). Rename it to VITE_CLERK_PUBLISHABLE_KEY so Vite exposes it to the frontend.',
    );
  }
  console.log(`✅ Clerk publishable key resolved (first 6 chars): ${masked}`);
}

console.log('Clerk environment variables successfully loaded.');
