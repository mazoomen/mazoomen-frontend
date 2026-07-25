// ── Centralized Environment Variable Access ─────────────────────────────

function getEnvVar(key: string, fallback?: string): string {
  let value: string | undefined;

  if (key === "NEXT_PUBLIC_API_URL") {
    value = process.env.NEXT_PUBLIC_API_URL;
  }

  if (key === "NEXT_PUBLIC_SITE_URL") {
    value = process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (key === "NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER") {
    value = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER;
  }

  console.log("ENV CHECK:", {
    key,
    value,
    fallback,
    finalValue: value ?? fallback,
  });

  if (value === undefined) {
    if (fallback !== undefined) return fallback;

    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

console.log("ALL NEXT PUBLIC ENV:", {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NODE_ENV: process.env.NODE_ENV,
});


/** Public API base URL (used by Axios client) */
export const API_BASE_URL = getEnvVar(
  "NEXT_PUBLIC_API_URL",
  "https://mazoomen-backend.onrender.com",
);

console.log("FINAL API_BASE_URL:", API_BASE_URL);


/** Public site URL */
export const SITE_URL = getEnvVar(
  "NEXT_PUBLIC_SITE_URL",
  "http://localhost:3001",
);

console.log("FINAL SITE_URL:", SITE_URL);


/** Google OAuth Client ID */
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";


/** Whether a real Google Client ID is configured */
export const isGoogleOAuthEnabled =
  GOOGLE_CLIENT_ID.length > 0 &&
  GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";


/** WhatsApp support number */
export const WHATSAPP_SUPPORT_NUMBER = getEnvVar(
  "NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER",
  "962793809686",
);


/** Whether the app is running in development mode */
export const IS_DEV = process.env.NODE_ENV === "development";

console.log("ENV MODULE LOADED:", {
  API_BASE_URL,
  SITE_URL,
});