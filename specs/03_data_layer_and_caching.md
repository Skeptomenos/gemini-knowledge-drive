# Data Layer & Smart Caching Specification

## 1. The "Snappy" Promise
To achieve sub-100ms navigation times, we cannot rely on the Drive API for every interaction. We must maintain a **local mirror** of the file metadata.

## 2. IndexedDB Schema (Dexie.js)

### Table: `files`
*   `id` (PK): String (Drive File ID)
*   `name`: String (Filename, indexed for Wikilink lookup)
*   `parents`: Array<String> (Parent Folder IDs)
*   `mimeType`: String
*   `modifiedTime`: String (ISO Date)
*   `version`: Number
*   `contentSnippet`: String (First 200 chars for previews - Optional)
*   `tags`: Array<String> (Parsed from Frontmatter)

### Table: `syncState`
*   `key`: String ("main")
*   `nextPageToken`: String (For `changes.list`)
*   `lastSync`: Number (Timestamp)
*   `rootFolderId`: String (The Shared Drive ID)

## 3. Synchronization Strategy

### Phase A: The "Big Bang" (First Run)
*   **Trigger**: First login or "Rebuild Index" button.
*   **Action**: `files.list` with `q="mimeType = 'text/markdown' or mimeType = 'application/vnd.google-apps.folder'"`.
*   **Recursion**: Fetch all pages.
*   **Write**: Bulk PUT to IndexedDB.

### Phase B: The "Incremental Sync" (Startup)
*   **Trigger**: App reload.
*   **Action**:
    1.  Load `nextPageToken` from `syncState`.
    2.  Call `changes.list` passing the token.
    3.  **Payload**: Returns only changed/deleted files.
    4.  **Apply**: Update/Delete records in IndexedDB.
    5.  **Save**: New `nextPageToken`.

### Phase C: Content Fetching (Lazy)
*   We do **NOT** cache full file content in IndexedDB (to save space and complexity).
*   **Read**: When user opens a file, we fetch content via `files.get(alt='media')`.
*   **Cache**: We cache the *current* session's open files in memory (Zustand).

## 4. Wikilink Resolution Engine
*   **Problem**: User types `[[Meeting Notes]]`. Drive has no idea what that is.
*   **Solution**:
    1.  Query IndexedDB: `db.files.where('name').startsWithIgnoreCase('Meeting Notes').first()`.
    2.  Return: `file_id_xyz`.
    3.  If multiple matches (duplicate filenames), use a heuristic (same folder > sibling folder > global).

## 5. Search Engine
*   **Engine**: `MiniSearch` (Client-side).
*   **Index**: Filename + Tags + ContentSnippet.
*   **Behavior**: Instant "Omnibar" search (Cmd+K).
