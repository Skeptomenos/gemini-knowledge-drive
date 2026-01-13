import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  loadGoogleIdentityServices,
  loadGapiClient,
  initTokenClient,
  requestAccessToken,
  isGapiDriveReady,
  type TokenResponse,
} from '@/lib/google-auth';
import { AuthContext, type AuthContextValue } from './auth-context';

interface User {
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeAuth() {
      try {
        await Promise.all([loadGoogleIdentityServices(), loadGapiClient()]);

        initTokenClient(
          (response: TokenResponse) => {
            if (response.error) {
              setState((prev) => ({
                ...prev,
                error: response.error_description ?? response.error ?? null,
                isLoading: false,
              }));
              return;
            }

            console.log('Token Received:', response.access_token.slice(0, 20) + '...');

            fetchUserInfo(response.access_token);
          },
          (error) => {
            setState((prev) => ({
              ...prev,
              error: error.message,
              isLoading: false,
            }));
          }
        );

        setIsGapiReady(isGapiDriveReady());
        setIsInitialized(true);
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to initialize auth',
          isLoading: false,
        }));
      }
    }

    initializeAuth();
  }, []);

  async function fetchUserInfo(accessToken: string) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();

      setState({
        user: {
          email: data.email,
          name: data.name,
          picture: data.picture,
        },
        accessToken,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      setIsGapiReady(isGapiDriveReady());
      console.log('gapi.client.drive available:', isGapiDriveReady());
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch user info',
        isLoading: false,
      }));
    }
  }

  const login = useCallback(() => {
    if (!isInitialized) {
      console.warn('Auth not initialized yet');
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    requestAccessToken();
  }, [isInitialized]);

  const logout = useCallback(() => {
    setState({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    isGapiReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
