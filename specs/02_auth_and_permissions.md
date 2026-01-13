# Auth & Permissions Specification

## 1. Google Integration Strategy
Since this is an **internal-only tool**, we will skip the public verification queue but must strictly configure the Google Cloud Project (GCP) to allow access to organization members.

## 2. OAuth 2.0 Scopes

### Primary Scope: `https://www.googleapis.com/auth/drive`
*   **Why?**
    *   **Indexing**: We need to list *all* files in the Shared Drive to resolve wikilinks (e.g., `[[Project Alpha]]` -> `file_id_123`).
    *   **Editing**: We need write access to save changes.
    *   **Metadata**: We need to read `parents` to build the folder tree.
*   **Why not `drive.file`?**
    *   `drive.file` only grants access to files *opened* by the user. It would prevent us from knowing that `Project Alpha.md` exists until the user manually opens it. This breaks the "Knowledge Base" promise.

### Secondary Scope: `https://www.googleapis.com/auth/drive.install`
*   **Why?**
    *   Required to appear in the "Open with" context menu in Drive UI.

## 3. Authentication Flow
1.  **Trigger**: User clicks "Open with Gemini Knowledge Drive" in Drive.
2.  **Redirect**: App loads. Checks for active session token.
3.  **No Token / Expired**:
    *   Trigger `google.accounts.oauth2.initTokenClient`.
    *   **UX**: Minimal full-screen loader "Connecting to Knowledge Base...".
    *   **Silent Refresh**: Attempt to refresh token in background before expiry.
4.  **Token Received**:
    *   Store in-memory (security best practice).
    *   Initialize `gapi.client.drive`.

## 4. Security Constraints
*   **Domain Restriction**: The OAuth Consent Screen will be set to **"Internal"**. Only users with `@yourcompany.com` emails can authorize.
*   **Token Storage**: Access tokens are **NEVER** stored in `localStorage`. They are kept in React Context memory. Refresh tokens are handled by the Google Identity Services library cookies/sessions.
