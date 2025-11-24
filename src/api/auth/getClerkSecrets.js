export const clerkSecretKey = process.env.CLERK_SECRET_KEY;

export function requireClerkSecretKey() {
  if (!clerkSecretKey) {
    const error = new Error('Missing CLERK_SECRET_KEY');
    error.statusCode = 401;
    throw error;
  }
  const maskedSecret = clerkSecretKey.slice(0, 6);
  console.log(`✅ Clerk secret key resolved (first 6 chars): ${maskedSecret}`);
  console.log('Clerk environment variables successfully loaded.');
  return clerkSecretKey;
}
