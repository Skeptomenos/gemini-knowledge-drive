# Error Handling & Offline Behavior Specification

## 1. Overview
Define how the application handles errors, network failures, and offline scenarios gracefully.

## 2. Error Categories

### 2.1 Authentication Errors
| Error | User Message | Action |
|-------|--------------|--------|
| Token expired | "Session expired. Please sign in again." | Redirect to login |
| Consent revoked | "Access to Drive was revoked. Please re-authorize." | Redirect to login |
| Domain restriction | "This app is only available for @company.com accounts." | Show error, logout |

### 2.2 Drive API Errors
| Error | User Message | Action |
|-------|--------------|--------|
| 403 Forbidden | "You don't have access to this file." | Show error toast |
| 404 Not Found | "This file no longer exists." | Remove from IndexedDB, show toast |
| 429 Rate Limited | "Too many requests. Retrying in X seconds..." | Exponential backoff |
| 500/503 Server Error | "Google Drive is temporarily unavailable." | Retry with backoff |

### 2.3 Sync Errors
| Error | User Message | Action |
|-------|--------------|--------|
| Partial sync failure | "Some files couldn't be synced. [Retry]" | Show warning banner |
| Full sync failure | "Unable to sync with Drive. [Retry] [Work Offline]" | Offer options |

### 2.4 Save Errors
| Error | User Message | Action |
|-------|--------------|--------|
| Network failure | "Couldn't save. Changes stored locally. [Retry]" | Queue for retry |
| Conflict detected | "This file was modified elsewhere. [Overwrite] [View Diff]" | Show conflict modal |

## 3. Offline Mode

### 3.1 Detection
*   Use `navigator.onLine` + `online`/`offline` events.
*   Also detect via failed API calls (more reliable).

### 3.2 Offline Capabilities
| Feature | Offline Behavior |
|---------|------------------|
| Browse files | Works (from IndexedDB) |
| Read content | Works (if previously cached) |
| Edit content | Works (saved to IndexedDB) |
| Save to Drive | Queued for when online |
| Search | Works (from local index) |
| Graph view | Works (from local data) |

### 3.3 Offline Indicator
*   Show persistent banner: "You're offline. Changes will sync when connected."
*   Icon in status bar showing connection state.

### 3.4 Sync Queue
*   Pending changes stored in IndexedDB `pendingChanges` table.
*   On reconnect: Process queue in order, handle conflicts.

## 4. Error Boundaries

### 4.1 Component-Level
*   Wrap major sections (Sidebar, Workspace, Graph) in error boundaries.
*   On error: Show "Something went wrong" with [Reload] button.
*   Log error to console (future: error reporting service).

### 4.2 Global Error Handler
*   Catch unhandled promise rejections.
*   Show toast notification for non-critical errors.
*   Show modal for critical errors requiring action.

## 5. Retry Logic

### 5.1 Exponential Backoff
```typescript
const backoff = (attempt: number) => Math.min(1000 * 2 ** attempt, 30000);
// Attempt 1: 2s, Attempt 2: 4s, Attempt 3: 8s, ... max 30s
```

### 5.2 Max Retries
*   API calls: 3 retries before showing error.
*   Sync operations: 5 retries before offering manual retry.

## 6. User-Facing Error Messages
*   **Be specific**: "Couldn't save 'Meeting Notes.md'" not "Save failed".
*   **Be actionable**: Always provide a next step (Retry, Dismiss, Learn More).
*   **Be calm**: Avoid alarming language. "We'll try again" not "CRITICAL ERROR".

## 7. Implementation Notes
*   Create `src/components/ui/ErrorBoundary.tsx`.
*   Create `src/components/ui/Toast.tsx` for notifications.
*   Create `src/lib/error-handler.ts` for centralized error processing.
*   Create `src/stores/networkStore.ts` for online/offline state.
*   Add `pendingChanges` table to Dexie schema.
