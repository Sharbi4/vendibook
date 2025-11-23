import crypto from 'crypto';
import { sql, bootstrapUsersTable, bootstrapVerificationTokensTable } from '../db.js';
import { sendEmail } from '../utils/email.js';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MINUTES = 30;

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buildBaseOrigin(origin) {
  if (origin) {
    return origin.replace(/\/$/, '');
  }

  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, '');
  }

  return 'https://vendibook.com';
}

export async function ensureVerificationInfrastructure() {
  await bootstrapUsersTable();
  await bootstrapVerificationTokensTable();
}

export async function cleanupExpiredVerificationTokens() {
  try {
    await sql`DELETE FROM verification_tokens WHERE expires_at < NOW()`;
  } catch (error) {
    console.warn('Failed to cleanup verification tokens:', error?.message || error);
  }
}

export async function issueVerificationToken(userId) {
  if (!userId) {
    throw new Error('Cannot issue verification token without user id');
  }

  await cleanupExpiredVerificationTokens();
  await sql`DELETE FROM verification_tokens WHERE user_id = ${userId}`;

  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await sql`
    INSERT INTO verification_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${hashedToken}, ${expiresAt.toISOString()})
  `;

  return { rawToken, expiresAt };
}

export function buildVerificationEmailHtml({ firstName, verificationUrl }) {
  const safeName = firstName ? firstName.trim() : 'there';
  return `
    <div style="margin-top:24px;">
      <div class="pill">Action Required</div>
      <h1 style="font-size:28px;color:#0f172a;margin:24px 0 16px;">Verify your email</h1>
      <p style="font-size:16px;color:#475569;line-height:1.6;">
        Hi ${safeName},<br/>
        Tap the button below to verify your email and unlock booking and hosting on Vendibook. This link expires in ${TOKEN_TTL_MINUTES} minutes.
      </p>
      <a class="cta" href="${verificationUrl}" target="_blank" rel="noopener noreferrer">Verify email</a>
      <p style="font-size:13px;color:#94a3b8;margin-top:24px;">
        If you did not create a Vendibook account, please ignore this email.
      </p>
    </div>
  `;
}

export async function sendVerificationEmailForUser(user, origin) {
  if (!user?.id || !user?.email) {
    throw new Error('Cannot send verification email without user context');
  }

  const baseOrigin = buildBaseOrigin(origin);
  const { rawToken } = await issueVerificationToken(user.id);
  const verificationUrl = `${baseOrigin}/verify-email?token=${encodeURIComponent(rawToken)}`;
  const html = buildVerificationEmailHtml({ firstName: user.first_name || user.display_name || user.business_name || user.email, verificationUrl });
  await sendEmail(user.email, 'Verify your Vendibook email', html);
  await sql`UPDATE users SET verification_sent_at = NOW(), updated_at = NOW() WHERE id = ${user.id}`;
  return verificationUrl;
}

export async function consumeVerificationToken(rawToken) {
  if (!rawToken) {
    throw new Error('Missing verification token');
  }

  const hashedToken = hashToken(rawToken);
  const rows = await sql`
    SELECT vt.id, vt.user_id, vt.expires_at,
           u.id as user_id, u.email, u.first_name, u.last_name, u.phone, u.role,
           u.created_at, u.updated_at, u.is_verified, u.verification_sent_at, u.verified_at
    FROM verification_tokens vt
    JOIN users u ON u.id = vt.user_id
    WHERE vt.token = ${hashedToken}
    LIMIT 1;
  `;

  const record = rows[0];

  if (!record) {
    return { valid: false, reason: 'invalid' };
  }

  const expiresAt = new Date(record.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    await sql`DELETE FROM verification_tokens WHERE id = ${record.id}`;
    return { valid: false, reason: 'expired' };
  }

  const updatedRows = await sql`
    UPDATE users
    SET is_verified = TRUE,
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = ${record.user_id}
    RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at, is_verified, verification_sent_at, verified_at;
  `;

  await sql`DELETE FROM verification_tokens WHERE user_id = ${record.user_id}`;

  return { valid: true, user: updatedRows[0] };
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}
