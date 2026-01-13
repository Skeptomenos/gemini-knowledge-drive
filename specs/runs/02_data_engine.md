# Implementation Run 2: The Data Engine (IndexedDB & Sync)

## 1. Goal
Implement the client-side database and the synchronization logic that mirrors Google Drive metadata to the browser. This is the "brain" of the application.

## 2. Dependencies
*   `dexie`: Wrapper for IndexedDB.
*   `dexie-react-hooks`: For easy React integration.
*   `idb`: (Optional, Dexie usually sufficient).

## 3. Files to Create

### Database Layer
*   `src/lib/db/schema.ts`: Define Dexie classes and interfaces.
*   `src/lib/db/index.ts`: Initialize the `KnowledgeDB` class.
    *   Stores: `files` (metadata), `syncState` (tokens).

### API Layer
*   `src/lib/api/drive.ts`:
    *   `listFiles(query, pageToken)`: Wrapper for `gapi.client.drive.files.list`.
    *   `fetchChanges(pageToken)`: Wrapper for `gapi.client.drive.changes.list`.
    *   `getFileContent(fileId)`: Wrapper for `gapi.client.drive.files.get`.

### Logic Layer
*   `src/lib/sync/SyncManager.ts`:
    *   **Singleton class**.
    *   `fullSync()`: Recursive fetch of all files -> Bulk Put to DB.
    *   `incrementalSync()`: Uses stored `startPageToken` to fetch deltas -> Apply to DB.
*   `src/hooks/useSync.ts`: React hook to trigger sync on mount and expose status (`syncing`, `progress`, `error`).

## 4. Key Logic

### The Sync Algorithm
```typescript
async function sync() {
  const state = await db.syncState.get('main');
  
  if (!state?.token) {
    // Phase 1: Big Bang
    let nextPageToken = null;
    do {
      const resp = await drive.files.list({
        q: "mimeType = 'text/markdown' or mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: "nextPageToken, files(id, name, mimeType, parents, modifiedTime, version)"
      });
      await db.files.bulkPut(resp.files);
      nextPageToken = resp.nextPageToken;
    } while (nextPageToken);
    
    // Get Start Page Token for future changes
    const tokenResp = await drive.changes.getStartPageToken();
    await db.syncState.put({ key: 'main', token: tokenResp.startPageToken });
  } else {
    // Phase 2: Incremental
    let nextToken = state.token;
    do {
      const resp = await drive.changes.list({ pageToken: nextToken });
      // Apply changes (deletes vs updates)
      await db.transaction('rw', db.files, async () => {
        resp.changes.forEach(change => {
           if (change.removed) db.files.delete(change.fileId);
           else if (change.file) db.files.put(change.file);
        });
      });
      nextToken = resp.newStartPageToken;
    } while (nextToken && nextToken !== state.token);
    await db.syncState.update('main', { token: nextToken });
  }
}
```

## 5. Verification Steps
1.  Run app. Auth.
2.  Check DevTools > Application > IndexedDB > `KnowledgeDB`.
3.  Verify `files` table is populated with Drive data.
4.  Add a file to Drive (externally). Reload app. Verify file appears in DB (Incremental Sync).
