'use strict';

const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');
const { APP_NAME } = require('../constants');

/**
 * Email service — the ONLY place that talks to Nodemailer/SMTP. Every other
 * service sends mail through here, so swapping Gmail for SendGrid/SES later is a
 * one-file change. Sending is best-effort: callers decide whether a failure
 * should matter (for the welcome email, it must NOT break user creation).
 */

/** True only when SMTP credentials are present. */
const isEmailConfigured = () => Boolean(env.smtp.user && env.smtp.pass);

// Lazily-created singleton transporter. We build it once, on first use, and only
// when configured — creating it with empty credentials would be pointless.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    // Port 465 uses implicit TLS (secure=true); 587 starts plain then upgrades
    // via STARTTLS (secure=false) — Nodemailer negotiates that automatically.
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
    // Hard timeouts so a blocked/slow SMTP host (common on cloud platforms like
    // Render) fails fast instead of hanging the caller. Without these, a blocked
    // outbound SMTP port can stall for a minute or more.
    connectionTimeout: 10_000, // TCP connect
    greetingTimeout: 10_000, // wait for the server 220 greeting
    socketTimeout: 15_000, // inactivity on the socket
  });
  return transporter;
};

/**
 * Generic, reusable send. Skips gracefully (logs a warning, returns null) when
 * SMTP isn't configured so local/dev environments keep working without mail.
 * Throws on an actual SMTP failure — the caller decides how to handle that.
 *
 * @param {{ to: string, subject: string, text: string, html?: string }} options
 * @returns {Promise<object|null>} Nodemailer info, or null when skipped
 */
const sendMail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    logger.warn(`[email] SMTP not configured — skipping email to ${to} ("${subject}")`);
    return null;
  }

  const from = env.smtp.from || env.smtp.user;
  const info = await getTransporter().sendMail({ from, to, subject, text, html });
  logger.info(`[email] Sent "${subject}" to ${to} (messageId: ${info.messageId})`);
  return info;
};

// Brand colours used across all outgoing mail. Inline (not classes) because
// email clients strip <style> blocks; indigo matches the app's --primary.
const BRAND = {
  accent: '#4F46E5',
  ink: '#1a1a1a',
  body: '#374151',
  muted: '#6b7280',
};

/**
 * Shared branded wrapper for HTML emails: light canvas, white card, indigo
 * header carrying the product name. Every email body renders inside this so
 * all mail from the platform looks like one product.
 */
const renderEmailShell = (bodyHtml) => `
  <div style="margin:0;padding:24px;background:#f4f4f7;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e6ea;">
      <div style="background:${BRAND.accent};padding:20px 28px;">
        <h1 style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">
          ${APP_NAME}
        </h1>
      </div>
      <div style="padding:28px;">
        ${bodyHtml}
      </div>
    </div>
  </div>
`;

/**
 * Welcome email for a newly-created employee. Builds the subject/body from the
 * user's details + the configured login URL and sends it via `sendMail`. Content
 * lives here (an email concern), keeping the caller (user.service) thin.
 *
 * @param {{ name: string, email: string, password: string, roleName: string }} params
 */
const sendWelcomeEmail = async ({ name, email, password, roleName }) => {
  const subject = `Welcome to ${APP_NAME}`;
  const loginUrl = env.app.loginUrl;

  const text = [
    `Hello ${name},`,
    '',
    `Your ${APP_NAME} account has been created successfully.`,
    '',
    `Email:\n${email}`,
    '',
    `Temporary Password:\n${password}`,
    '',
    `Role:\n${roleName}`,
    '',
    `Login URL:\n${loginUrl}`,
    '',
    'For your security, this is a temporary password. You will be asked to set a',
    'new password the first time you log in.',
  ].join('\n');

  const html = renderEmailShell(`
    <p style="margin:0 0 16px;font-size:15px;">Hello ${name},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.body};">
      Your ${APP_NAME} account has been created successfully.
    </p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong><br/>${email}</p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>Temporary Password:</strong><br/>${password}</p>
    <p style="margin:0 0 16px;font-size:14px;"><strong>Role:</strong><br/>${roleName}</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${loginUrl}"
         style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;
                font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
        Sign in
      </a>
    </div>
    <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.muted};">
      For your security, this is a temporary password. You will be asked to set a
      new password the first time you log in.
    </p>
  `);

  return sendMail({ to: email, subject, text, html });
};

/**
 * Password-reset email. Contains a branded "Reset Password" button pointing at
 * the frontend reset page with the one-time token, the raw URL as a fallback, and
 * an expiry notice. The plaintext token appears ONLY in this email — never stored.
 *
 * @param {{ name: string, email: string, resetUrl: string, expiresMinutes: number }} params
 */
const sendResetPasswordEmail = async ({ name, email, resetUrl, expiresMinutes }) => {
  const subject = `Reset your password — ${APP_NAME}`;

  const text = [
    `Hello ${name},`,
    '',
    'We received a request to reset the password for your account.',
    '',
    'Reset your password using the link below:',
    resetUrl,
    '',
    `This link will expire in ${expiresMinutes} minutes and can be used only once.`,
    '',
    "If you didn't request this, you can safely ignore this email — your password",
    'will remain unchanged.',
  ].join('\n');

  const html = renderEmailShell(`
    <p style="margin:0 0 16px;font-size:15px;">Hello ${name},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.body};">
      We received a request to reset the password for your account. Click the button
      below to choose a new password.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;
                font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
        Reset Password
      </a>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.muted};">
      Or paste this link into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:13px;word-break:break-all;">
      <a href="${resetUrl}" style="color:${BRAND.accent};">${resetUrl}</a>
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:#b45309;background:#fffbeb;
              border:1px solid #fde68a;border-radius:8px;padding:10px 12px;">
      ⏱ This link expires in ${expiresMinutes} minutes and can be used only once.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.muted};">
      If you didn't request a password reset, you can safely ignore this email —
      your password will remain unchanged.
    </p>
  `);

  return sendMail({ to: email, subject, text, html });
};

module.exports = { isEmailConfigured, sendMail, sendWelcomeEmail, sendResetPasswordEmail };
