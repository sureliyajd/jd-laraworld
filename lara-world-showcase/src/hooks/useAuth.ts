// useAuth.ts
import { useState, useEffect } from 'react';
import { authService, User } from '@/services/auth';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const authUrl = await authService.initiatePKCEAuth();
      window.location.href = authUrl;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.loginWithPassword(email, password);
      await loadUser();
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const handleAuthCallback = async (code: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.handleAuthCallback(code);
      await loadUser();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
    }
  };

  const loadUser = async () => {
    if (!authService.isAuthenticated()) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load user',
      });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return {
    ...authState,
    login,
    loginWithPassword,
    logout,
    handleAuthCallback,
    loadUser,
  };
};
