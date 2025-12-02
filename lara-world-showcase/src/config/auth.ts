// auth.ts - Configuration for OAuth2 authentication
export const AUTH_CONFIG = {
  // Backend API URL - Uses VITE_API_BASE_ENDPOINT from frontend .env.* files
  // Expected format (dev): http://localhost:8000/api
  // In production, this must be set via .env.production or CI env vars.
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_ENDPOINT ??
    (import.meta.env.DEV ? "http://localhost:8000/api" : ""),

  // Backend Base URL (without /api) - Uses VITE_API_BASE from frontend .env.* files
  // Expected format (dev): http://localhost:8000
  API_BASE:
    import.meta.env.VITE_API_BASE ??
    (import.meta.env.DEV ? "http://localhost:8000" : ""),

  // OAuth2 Client Configuration
  // Use a public client (no secret) with PKCE for SPA use.
  CLIENT_ID: import.meta.env.VITE_OAUTH_CLIENT_ID,

  // DO NOT put a real client secret in the frontend – it will be public.
  // If your flow requires a secret, keep it on the backend only.
  CLIENT_SECRET: "",

  // OAuth2 Scopes
  SCOPES: import.meta.env.VITE_OAUTH_SCOPES || "",

  // Redirect URI (must match what's configured in Laravel Passport)
  REDIRECT_URI: `${window.location.origin}/auth/callback`,

  // Token storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    TOKEN_TYPE: "token_type",
    EXPIRES_IN: "expires_in",
  },

  // PKCE Configuration
  PKCE: {
    CODE_VERIFIER_LENGTH: 128,
    CODE_CHALLENGE_METHOD: "S256",
  },
} as const;
