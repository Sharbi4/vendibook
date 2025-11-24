export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const clerkFrontendApi = import.meta.env.VITE_CLERK_FRONTEND_API ?? undefined;

if (!clerkPublishableKey) {
  console.error(
    '❌ Clerk publishable key is missing — check your .env.local and Vercel environment variables.',
  );
} else {
  const masked = clerkPublishableKey.slice(0, 6);
  console.log(`✅ Clerk publishable key resolved (first 6 chars): ${masked}`);
}

console.log('Clerk environment variables successfully loaded.');
