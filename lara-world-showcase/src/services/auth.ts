// auth.ts
import { generateCodeVerifier, generateCodeChallenge } from '@/utils/pkce';
import { AUTH_CONFIG } from '@/config/auth';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    this.refreshToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }

  private saveTokensToStorage(tokens: AuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN_TYPE, tokens.token_type);
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.EXPIRES_IN, tokens.expires_in.toString());
  }

  private clearTokensFromStorage(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN_TYPE);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.EXPIRES_IN);
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public async loginWithPassword(email: string, password: string): Promise<AuthTokens> {
    // Use the existing AuthController login endpoint
    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid credentials');
    }

    const data = await response.json();
    
    // Convert the response to AuthTokens format
    const tokens: AuthTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 3600,
    };
    
    this.saveTokensToStorage(tokens);
    
    return tokens;
  }

  public async initiatePKCEAuth(): Promise<string> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code verifier for later use
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    
    // Build authorization URL
    const authUrl = new URL(`${AUTH_CONFIG.API_BASE_URL}/oauth/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', AUTH_CONFIG.CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', AUTH_CONFIG.REDIRECT_URI);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', AUTH_CONFIG.PKCE.CODE_CHALLENGE_METHOD);
    authUrl.searchParams.set('scope', AUTH_CONFIG.SCOPES);
    
    return authUrl.toString();
  }

  public async handleAuthCallback(code: string): Promise<AuthTokens> {
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    
    if (!codeVerifier) {
      throw new Error('Code verifier not found. Please try logging in again.');
    }

    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: AUTH_CONFIG.CLIENT_ID,
        client_secret: AUTH_CONFIG.CLIENT_SECRET,
        redirect_uri: AUTH_CONFIG.REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Authentication failed');
    }

    const tokens: AuthTokens = await response.json();
    this.saveTokensToStorage(tokens);
    
    // Clear the code verifier
    sessionStorage.removeItem('pkce_code_verifier');
    
    return tokens;
  }

  public async getCurrentUser(): Promise<User> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        await this.refreshAccessToken();
        return this.getCurrentUser();
      }
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  public async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: AUTH_CONFIG.CLIENT_ID,
        client_secret: AUTH_CONFIG.CLIENT_SECRET,
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      // If refresh fails, clear tokens and redirect to login
      this.logout();
      throw new Error('Token refresh failed');
    }

    const tokens: AuthTokens = await response.json();
    this.saveTokensToStorage(tokens);
    return tokens;
  }

  public logout(): void {
    this.clearTokensFromStorage();
    // Redirect to login page
    window.location.href = '/portal/login';
  }

  public async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Try to refresh token and retry
      try {
        await this.refreshAccessToken();
        return this.makeAuthenticatedRequest(url, options);
      } catch (error) {
        this.logout();
        throw error;
      }
    }

    return response;
  }
}

// Export a singleton instance
export const authService = new AuthService();
