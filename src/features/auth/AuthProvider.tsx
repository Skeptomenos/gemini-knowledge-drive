import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  loadGoogleIdentityServices,
  loadGapiClient,
  initializeSignInWithGoogle,
  promptSignIn,
  disableAutoSelect,
  initTokenClient,
  requestAccessToken,
  requestSilentAccessToken,
  setGapiToken,
  decodeIdToken,
  isGapiDriveReady,
  type CredentialResponse,
  type TokenResponse,
  type PromptNotification,
} from '@/lib/google-auth';
import { AuthContext, type AuthContextValue } from './auth-context';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gkd-access-token',
  TOKEN_EXPIRY: 'gkd-token-expiry',
  USER: 'gkd-user',
  ID_TOKEN: 'gkd-id-token',
} as const;

// Buffer before token expiry (5 minutes in ms)
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

interface User {
  email: string;
  name: string;
  picture: string;
}

// Storage helpers
function saveSession(
  accessToken: string,
  expiresIn: number,
  user: User,
  idToken?: string
): void {
  const expiryTime = Date.now() + expiresIn * 1000 - TOKEN_EXPIRY_BUFFER_MS;
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  if (idToken) {
    localStorage.setItem(STORAGE_KEYS.ID_TOKEN, idToken);
  }
}

function getStoredSession(): { accessToken: string; user: User } | null {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);

  if (!accessToken || !expiryStr || !userStr) {
    return null;
  }

  const expiry = Number(expiryStr);
  if (Date.now() >= expiry) {
    // Token expired, clear storage
    clearSession();
    return null;
  }

  try {
    const user = JSON.parse(userStr) as User;
    return { accessToken, user };
  } catch {
    clearSession();
    return null;
  }
}

function getStoredUser(): User | null {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
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

  // Track auth flow state
  const pendingUserRef = useRef<User | null>(null);
  const hasAttemptedAutoSignIn = useRef(false);

  // Handle successful credential response (ID token from Sign In With Google)
  const handleCredentialResponse = useCallback((response: CredentialResponse) => {
    console.log('[Auth] Received credential response');
    try {
      const payload = decodeIdToken(response.credential);
      const user: User = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Store user temporarily while we get access token
      pendingUserRef.current = user;

      // Now request access token for Drive API
      console.log('[Auth] Got ID token, requesting access token for Drive API...');
      requestSilentAccessToken();
    } catch (err) {
      console.error('[Auth] Failed to decode ID token:', err);
      setState((prev) => ({
        ...prev,
        error: 'Failed to process sign-in response',
        isLoading: false,
      }));
    }
  }, []);

  // Handle access token response
  const handleTokenResponse = useCallback((response: TokenResponse) => {
    if (response.error) {
      console.log('[Auth] Token error:', response.error);
      // If silent token request failed but we have a pending user, 
      // we need to request with user interaction
      if (pendingUserRef.current) {
        console.log('[Auth] Silent token failed, requesting with prompt...');
        requestAccessToken('');
        return;
      }
      setState((prev) => ({
        ...prev,
        error: response.error_description ?? response.error ?? null,
        isLoading: false,
      }));
      return;
    }

    console.log('[Auth] Access token received');

    // Get user from pending or storage
    const user = pendingUserRef.current ?? getStoredUser();
    if (!user) {
      console.error('[Auth] No user info available');
      setState((prev) => ({
        ...prev,
        error: 'No user info available',
        isLoading: false,
      }));
      return;
    }

    // Save session
    const idToken = localStorage.getItem(STORAGE_KEYS.ID_TOKEN);
    saveSession(response.access_token, response.expires_in, user, idToken ?? undefined);

    // Set token on gapi client
    setGapiToken(response.access_token);

    setState({
      user,
      accessToken: response.access_token,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });

    setIsGapiReady(isGapiDriveReady());
    pendingUserRef.current = null;
  }, []);

  // Handle token error
  const handleTokenError = useCallback((error: { type: string; message: string }) => {
    console.log('[Auth] Token error callback:', error);
    // If we have a pending user, try interactive flow
    if (pendingUserRef.current) {
      console.log('[Auth] Trying interactive token request...');
      requestAccessToken();
      return;
    }
    setState((prev) => ({
      ...prev,
      error: error.message,
      isLoading: false,
    }));
  }, []);

  // Handle prompt notification (for debugging auto sign-in)
  const handlePromptNotification = useCallback((notification: PromptNotification) => {
    if (notification.isNotDisplayed()) {
      console.log('[Auth] Prompt not displayed:', notification.getNotDisplayedReason());
    }
    if (notification.isSkippedMoment()) {
      console.log('[Auth] Prompt skipped:', notification.getSkippedReason());
    }
    if (notification.isDismissedMoment()) {
      console.log('[Auth] Prompt dismissed:', notification.getDismissedReason());
    }

    // If prompt was not displayed or skipped, and no stored session, show login button
    if (
      (notification.isNotDisplayed() || notification.isSkippedMoment()) &&
      !getStoredSession()
    ) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      try {
        console.log('[Auth] Initializing...');
        await Promise.all([loadGoogleIdentityServices(), loadGapiClient()]);

        // Check for stored valid session first
        const storedSession = getStoredSession();
        console.log('[Auth] Stored session check:', {
          hasSession: !!storedSession,
          hasToken: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          expiry: localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
          now: Date.now(),
        });

        if (storedSession) {
          console.log('[Auth] Restoring session from localStorage');
          // Set token on gapi client
          setGapiToken(storedSession.accessToken);

          setState({
            user: storedSession.user,
            accessToken: storedSession.accessToken,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
          setIsGapiReady(isGapiDriveReady());
          setIsInitialized(true);
          return;
        }

        // Initialize Sign In With Google (for authentication)
        initializeSignInWithGoogle(handleCredentialResponse);

        // Initialize token client (for Drive API access)
        initTokenClient(handleTokenResponse, handleTokenError);

        setIsGapiReady(isGapiDriveReady());
        setIsInitialized(true);

        // Attempt automatic sign-in
        if (!hasAttemptedAutoSignIn.current) {
          hasAttemptedAutoSignIn.current = true;
          console.log('[Auth] Attempting automatic sign-in...');
          promptSignIn(handlePromptNotification);
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to initialize auth',
          isLoading: false,
        }));
      }
    }

    initializeAuth();
  }, [handleCredentialResponse, handleTokenResponse, handleTokenError, handlePromptNotification]);

  const login = useCallback(() => {
    if (!isInitialized) {
      console.warn('[Auth] Auth not initialized yet');
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    // Trigger the Sign In With Google prompt
    promptSignIn(handlePromptNotification);
  }, [isInitialized, handlePromptNotification]);

  const logout = useCallback(() => {
    clearSession();
    disableAutoSelect(); // Prevent auto sign-in on next load
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
