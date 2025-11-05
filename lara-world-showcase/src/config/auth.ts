// auth.ts - Configuration for OAuth2 authentication
export const AUTH_CONFIG = {
  // Backend API URL - Uses VITE_API_BASE_ENDPOINT from frontend .env file
  // Expected format: http://localhost:8001/api
  API_BASE_URL: import.meta.env.VITE_API_BASE_ENDPOINT || 'http://localhost:8000/api',
  
  // Backend Base URL (without /api) - Uses VITE_API_BASE from frontend .env file
  // Expected format: http://localhost:8001
  API_BASE: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  
  // OAuth2 Client Configuration
  // These should match your Laravel Passport client configuration
  CLIENT_ID: '0199a3a9-b10c-72c8-bcbc-3ef1cba93ba9', // Your Laravel Passport client ID
  CLIENT_SECRET: 'tlYS9JJqQJdjrG8B3lmXUsSrT2QYGDRKEv6zUM5M', // Your Laravel Passport client secret
  
  // OAuth2 Scopes
  SCOPES: '', // Add any required scopes here
  
  // Redirect URI (must match what's configured in Laravel Passport)
  REDIRECT_URI: `${window.location.origin}/auth/callback`,
  
  // Token storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    TOKEN_TYPE: 'token_type',
    EXPIRES_IN: 'expires_in',
  },
  
  // PKCE Configuration
  PKCE: {
    CODE_VERIFIER_LENGTH: 128,
    CODE_CHALLENGE_METHOD: 'S256',
  },
} as const;
