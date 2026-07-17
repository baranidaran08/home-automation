/**
 * Centralised, validated access to public environment variables. Import from
 * here instead of reading `process.env` throughout the app.
 */
export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Xen Automation',
  // Google OAuth 2.0 Web client id. Must match the backend's GOOGLE_CLIENT_ID.
  // Empty when Google Sign-In isn't configured — the UI hides the button then.
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
} as const;
