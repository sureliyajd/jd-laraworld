// auth.ts - Configuration for OAuth2 authentication
export const AUTH_CONFIG = {
  // Backend API URL - Update this to match your Laravel backend
  API_BASE_URL: 'http://127.0.0.1:8000/api',
  
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
