import dotenv from 'dotenv';

if (typeof process !== 'undefined' && !process.env.RESEND_API_KEY) {
  dotenv.config({ path: '.env.local' });
  if (!process.env.RESEND_API_KEY) {
    dotenv.config({ path: '.env' });
  }
}

const EMAIL_PROVIDER_URL = 'https://api.resend.com/emails';

function getApiKey() {
  return process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.VERCEL_EMAIL_API_KEY || '';
}

function wrapHtml(content) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vendibook</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f7fafc; margin: 0; padding: 24px; color: #1f2937; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08); }
        .logo { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; color: #ff4d1c; text-decoration: none; }
        .pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #fb923c; background: #fff7ed; border-radius: 9999px; padding: 6px 12px; text-transform: uppercase; letter-spacing: 0.05em; }
        .cta { display: inline-block; margin-top: 24px; padding: 14px 26px; border-radius: 9999px; background: #ff4d1c; color: #ffffff; font-weight: 600; text-decoration: none; }
        .footer { margin-top: 32px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <a class="logo" href="https://vendibook.com">vendibook</a>
        ${content}
        <div class="footer">
          © ${new Date().getFullYear()} Vendibook. All rights reserved.
        </div>
      </div>
    </body>
  </html>`;
}

export async function sendEmail(to, subject, html) {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('Email provider API key missing. Email was not sent but request will be treated as success.');
    return { sent: false, skipped: true };
  }

  if (!to || !subject) {
    throw new Error('Missing to or subject for email');
  }

  const payload = {
    from: process.env.VERIFIED_SENDER_EMAIL || 'Vendibook <notifications@vendibook.com>',
    to: Array.isArray(to) ? to : [to],
    subject,
    html: wrapHtml(html)
  };

  const response = await fetch(EMAIL_PROVIDER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${errorBody}`);
  }

  return response.json();
}
