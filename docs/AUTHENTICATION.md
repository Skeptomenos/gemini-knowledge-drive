# Google Authentication Implementation

This document describes the authentication architecture for Gemini Knowledge Drive, a browser-only SPA that accesses Google Drive.

## Overview

The app uses **Google Identity Services (GIS)** with a two-part approach:

1. **Sign In With Google** - For user authentication (who the user is)
2. **Token Model** - For API authorization (access to Drive)

This separation enables automatic sign-in for returning users while maintaining access to Google Drive APIs.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Visit                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Check localStorage    │
                    │ for valid session     │
                    └───────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │ Valid token exists  │         │ No valid token      │
    │ → Restore session   │         │ → Prompt sign-in    │
    └─────────────────────┘         └─────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────┐
                                    │ auto_select: true   │
                                    │ One Tap / FedCM     │
                                    └─────────────────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                                    ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Auto sign-in    │     │ User clicks     │
                        │ (returning user)│     │ (new user)      │
                        └─────────────────┘     └─────────────────┘
                                    │                       │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌─────────────────────┐
                                    │ Receive ID Token    │
                                    │ (user identity)     │
                                    └─────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────┐
                                    │ Request Access Token│
                                    │ (Drive API access)  │
                                    └─────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────┐
                                    │ Save to localStorage│
                                    │ → User authenticated│
                                    └─────────────────────┘
```

## Key Components

### 1. Sign In With Google (`google.accounts.id`)

Used for **authentication** - identifying who the user is.

```typescript
google.accounts.id.initialize({
  client_id: 'YOUR_CLIENT_ID',
  callback: handleCredentialResponse,
  auto_select: true,  // Enable automatic sign-in
  use_fedcm_for_prompt: true,  // Use FedCM for privacy
});

google.accounts.id.prompt();  // Show One Tap or auto sign-in
```

**Features:**
- `auto_select: true` - Automatically signs in returning users without interaction
- Returns an **ID Token** (JWT) containing user profile information
- Supports FedCM (Federated Credential Management) for better privacy

### 2. Token Model (`google.accounts.oauth2`)

Used for **authorization** - getting access to Google Drive APIs.

```typescript
const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: 'YOUR_CLIENT_ID',
  scope: 'https://www.googleapis.com/auth/drive',
  callback: handleTokenResponse,
});

tokenClient.requestAccessToken({ prompt: '' });  // Silent request
```

**Features:**
- Returns an **Access Token** for API calls
- `prompt: ''` attempts silent token acquisition
- Access tokens expire in ~1 hour

## Session Persistence

Sessions are persisted in `localStorage`:

| Key | Value | Purpose |
|-----|-------|---------|
| `gkd-access-token` | Access token string | API authentication |
| `gkd-token-expiry` | Timestamp (ms) | Token expiration check |
| `gkd-user` | JSON user object | User display info |
| `gkd-id-token` | ID token (JWT) | User identity |

### Token Expiry Buffer

A 5-minute buffer is applied to token expiry to avoid edge cases:

```typescript
const expiryTime = Date.now() + expiresIn * 1000 - (5 * 60 * 1000);
```

## Authentication Flow

### First-Time User

1. User visits app
2. No stored session found
3. One Tap prompt appears (or Sign In button)
4. User clicks to sign in
5. Google consent screen for Drive permissions
6. ID token received → Access token requested
7. Session saved to localStorage
8. User is authenticated

### Returning User (Token Valid)

1. User visits app
2. Valid session found in localStorage
3. Session restored immediately
4. User is authenticated (no prompts)

### Returning User (Token Expired)

1. User visits app
2. Expired session found, cleared
3. One Tap prompt with `auto_select: true`
4. If user previously consented → auto sign-in (no click needed)
5. ID token received → Access token requested
6. New session saved
7. User is authenticated

## Important Configuration

### Google Cloud Console

The OAuth Client ID must have these configured:

**Authorized JavaScript Origins:**
- `https://drive-md-app-v1.web.app` (production)
- `http://localhost:5173` (development)

**Authorized Redirect URIs:**
- Same as above

### Firebase Hosting Headers

Required headers in `firebase.json`:

```json
{
  "source": "index.html",
  "headers": [
    {
      "key": "Cross-Origin-Opener-Policy",
      "value": "same-origin-allow-popups"
    }
  ]
}
```

This allows the OAuth popup/iframe to communicate with the parent window.

## Logout

On logout, we:

1. Clear all session data from localStorage
2. Call `google.accounts.id.disableAutoSelect()` to prevent auto sign-in on next visit

```typescript
function logout() {
  clearSession();
  disableAutoSelect();
}
```

## Security Considerations

### Token Storage

- **Access tokens** are stored in `localStorage` for persistence across sessions
- Tokens expire in ~1 hour, limiting exposure window
- For higher security requirements, consider:
  - Using `sessionStorage` (cleared on tab close)
  - Backend with Authorization Code flow and refresh tokens

### ID Token Verification

- ID tokens are decoded client-side for user info
- For security-critical applications, verify ID tokens on a backend server

### Scopes

The app requests these OAuth scopes:

| Scope | Purpose |
|-------|---------|
| `drive` | Full Drive access for file sync |
| `drive.install` | Install app in Drive UI |

## Troubleshooting

### "Cross-Origin-Opener-Policy" errors

Add the `same-origin-allow-popups` header to `firebase.json`.

### Auto sign-in not working

1. Check if `disableAutoSelect()` was called (g_state cookie)
2. User may have dismissed the prompt (blocked for 1 day)
3. FedCM requires recent sign-in activity (last 10 minutes)

### Token not persisting

1. Check if localStorage is available
2. Check for errors in console during save
3. Verify the token response includes `expires_in`

### Cached old JavaScript

If auth changes don't take effect:
1. Hard refresh (Cmd+Shift+R)
2. Clear site data in DevTools → Application → Storage

## Files

| File | Purpose |
|------|---------|
| `src/lib/google-auth.ts` | Google Identity Services wrapper |
| `src/features/auth/AuthProvider.tsx` | React auth context provider |
| `src/features/auth/auth-context.ts` | Auth context type definitions |
| `src/features/auth/useAuth.ts` | Hook to consume auth context |

## References

- [Sign In With Google Overview](https://developers.google.com/identity/gsi/web/guides/overview)
- [Automatic Sign-In](https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out)
- [Token Model Overview](https://developers.google.com/identity/oauth2/web/guides/overview)
- [FedCM Integration](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
