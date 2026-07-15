/**
 * Centralised, validated access to public environment variables. Import from
 * here instead of reading `process.env` throughout the app.
 */
export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Home Automation Admin',
} as const;
