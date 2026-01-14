declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
        };
      };
    };
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: { discoveryDocs?: string[] }) => Promise<void>;
        drive: unknown;
      };
    };
  }
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: { type: string; message: string }) => void;
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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
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

let tokenClient: TokenClient | null = null;

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

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: onSuccess,
    error_callback: onError,
  });

  return tokenClient;
}

export function requestAccessToken(prompt?: 'consent' | 'select_account'): void {
  if (!tokenClient) {
    throw new Error('Token client not initialized. Call initTokenClient first.');
  }
  tokenClient.requestAccessToken({ prompt });
}

export function isGapiDriveReady(): boolean {
  return gapiLoaded && !!window.gapi?.client?.drive;
}
