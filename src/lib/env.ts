// ── Centralized Environment Variable Access ─────────────────────────────
// All environment variables should be accessed through this module.
// This provides runtime validation and type safety.

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Please add it to your .env.local file.`,
    );
  }
  return value;
}

/** Public API base URL (used by Axios client) */
export const API_BASE_URL = getEnvVar(
  "NEXT_PUBLIC_API_URL",
  "http://localhost:3000",
);

/** Public site URL (used for constructing shareable links) */
export const SITE_URL = getEnvVar(
  "NEXT_PUBLIC_SITE_URL",
  "http://localhost:3001",
);

/** Google OAuth Client ID — empty string means Google OAuth is disabled */
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/** Whether a real Google Client ID is configured */
export const isGoogleOAuthEnabled =
  GOOGLE_CLIENT_ID.length > 0 &&
  GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

/** WhatsApp support number for purchase request expediting */
export const WHATSAPP_SUPPORT_NUMBER = getEnvVar(
  "NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER",
  "962793809686",
);

/** Whether the app is running in development mode */
export const IS_DEV = process.env.NODE_ENV === "development";
