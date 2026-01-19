declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: IdConfiguration) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
          hasGrantedAllScopes: (response: TokenResponse, ...scopes: string[]) => boolean;
        };
      };
    };
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: { discoveryDocs?: string[] }) => Promise<void>;
        drive: unknown;
        setToken: (token: { access_token: string }) => void;
      };
    };
  }
}

// Sign In With Google configuration
interface IdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
  login_uri?: string;
  native_callback?: (response: CredentialResponse) => void;
  nonce?: string;
  use_fedcm_for_prompt?: boolean;
}

interface CredentialResponse {
  credential: string; // JWT ID token
  select_by: string;
  client_id: string;
}

interface PromptNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

// Token client configuration (for API access)
interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: { type: string; message: string }) => void;
  prompt?: string;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

// Decoded ID token payload
export interface IdTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.install',
].join(' ');

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GAPI_SCRIPT_URL = 'https://apis.google.com/js/api.js';
const DRIVE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

let gisLoaded = false;
let gapiLoaded = false;

export async function loadGoogleIdentityServices(): Promise<void> {
  if (gisLoaded) return;
  await loadScript(GIS_SCRIPT_URL);
  gisLoaded = true;
}

export async function loadGapiClient(): Promise<void> {
  if (gapiLoaded) return;
  await loadScript(GAPI_SCRIPT_URL);

  await new Promise<void>((resolve) => {
    window.gapi!.load('client', resolve);
  });

  await window.gapi!.client.init({
    discoveryDocs: [DRIVE_DISCOVERY_DOC],
  });

  gapiLoaded = true;
}

/**
 * Decode a JWT ID token without verification (verification should be done server-side)
 */
export function decodeIdToken(token: string): IdTokenPayload {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

/**
 * Initialize Sign In With Google for authentication.
 * Supports automatic sign-in for returning users.
 */
export function initializeSignInWithGoogle(
  onCredentialResponse: (response: CredentialResponse) => void
): void {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services not loaded');
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('VITE_GOOGLE_CLIENT_ID environment variable not set');
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: onCredentialResponse,
    auto_select: true, // Enable automatic sign-in for returning users
    cancel_on_tap_outside: false,
    use_fedcm_for_prompt: true, // Use FedCM for better privacy
  });
}

/**
 * Display the One Tap prompt or redirect to sign-in.
 * For returning users with auto_select, this may sign them in automatically.
 */
export function promptSignIn(
  onPromptNotification?: (notification: PromptNotification) => void
): void {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services not loaded');
  }
  window.google.accounts.id.prompt(onPromptNotification);
}

/**
 * Render the Sign In With Google button in a container.
 */
export function renderSignInButton(
  container: HTMLElement,
  options?: Partial<GsiButtonConfiguration>
): void {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services not loaded');
  }
  window.google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    ...options,
  });
}

/**
 * Disable automatic sign-in (call on logout).
 */
export function disableAutoSelect(): void {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
}

// Token client for API access
let tokenClient: TokenClient | null = null;
let tokenCallback: ((response: TokenResponse) => void) | null = null;
let tokenErrorCallback: ((error: { type: string; message: string }) => void) | null = null;

export function initTokenClient(
  onSuccess: (response: TokenResponse) => void,
  onError: (error: { type: string; message: string }) => void
): TokenClient {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services not loaded');
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('VITE_GOOGLE_CLIENT_ID environment variable not set');
  }

  tokenCallback = onSuccess;
  tokenErrorCallback = onError;

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (tokenCallback) tokenCallback(response);
    },
    error_callback: (error) => {
      if (tokenErrorCallback) tokenErrorCallback(error);
    },
  });

  return tokenClient;
}

export function requestAccessToken(prompt?: 'consent' | 'select_account' | ''): void {
  if (!tokenClient) {
    throw new Error('Token client not initialized. Call initTokenClient first.');
  }
  tokenClient.requestAccessToken({ prompt });
}

/**
 * Attempt silent token refresh using existing Google session.
 * Uses prompt: '' which triggers no UI if user has an active Google session
 * and has previously authorized this app.
 */
export function requestSilentAccessToken(): void {
  if (!tokenClient) {
    throw new Error('Token client not initialized. Call initTokenClient first.');
  }
  tokenClient.requestAccessToken({ prompt: '' });
}

/**
 * Set the access token on the gapi client for API calls.
 */
export function setGapiToken(accessToken: string): void {
  if (window.gapi?.client) {
    window.gapi.client.setToken({ access_token: accessToken });
  }
}

export function isGapiDriveReady(): boolean {
  return gapiLoaded && !!window.gapi?.client?.drive;
}

export function getClientId(): string {
  return GOOGLE_CLIENT_ID;
}

export type { CredentialResponse, PromptNotification, GsiButtonConfiguration };
