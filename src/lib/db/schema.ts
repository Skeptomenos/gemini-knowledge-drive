import Dexie, { type EntityTable } from 'dexie';

/**
 * FileNode represents a file or folder from Google Drive.
 * Stored in IndexedDB for sub-100ms navigation.
 */
export interface FileNode {
  /** Drive File ID (primary key) */
  id: string;
  /** Filename - indexed for Wikilink lookup */
  name: string;
  /** Parent Folder IDs */
  parents: string[];
  /** MIME type (text/markdown or application/vnd.google-apps.folder) */
  mimeType: string;
  /** ISO date string of last modification */
  modifiedTime: string;
  /** Drive file version number */
  version: number;
  /** First 200 chars for previews (optional) */
  contentSnippet?: string;
  /** Tags parsed from frontmatter */
  tags: string[];
  /** Aliases parsed from frontmatter */
  aliases: string[];
  /** Whether this file has been deleted (for soft delete tracking) */
  trashed: boolean;
}

/**
 * SyncState tracks synchronization metadata.
 * Single record with key="main".
 */
export interface SyncState {
  /** Always "main" - single record */
  key: string;
  /** Token for changes.list incremental sync */
  nextPageToken: string | null;
  /** Timestamp of last successful sync */
  lastSync: number;
  /** The Shared Drive ID being synced */
  driveId: string | null;
  /** Root folder ID within the drive */
  rootFolderId: string | null;
}

/**
 * PendingChange represents a queued offline change.
 * Stored when network is unavailable, processed on reconnect.
 * Spec Reference: specs/10_error_handling_and_offline.md
 */
export interface PendingChange {
  /** Auto-incrementing local ID (primary key) */
  id?: number;
  /** Drive File ID this change applies to */
  fileId: string;
  /** Type of change operation */
  type: 'create' | 'update' | 'delete';
  /** The content or metadata changes to apply */
  content?: string;
  /** Timestamp when the change was queued */
  timestamp: number;
  /** Number of retry attempts */
  retryCount: number;
  /** Last error message if retry failed */
  lastError?: string;
}

/**
 * KnowledgeDB - Dexie database for local Drive metadata cache.
 * 
 * Tables:
 * - files: FileNode records indexed by id, name, parents, mimeType, modifiedTime
 * - syncState: Single SyncState record tracking sync progress
 * - pendingChanges: Queued offline changes awaiting sync
 */
export class KnowledgeDB extends Dexie {
  files!: EntityTable<FileNode, 'id'>;
  syncState!: EntityTable<SyncState, 'key'>;
  pendingChanges!: EntityTable<PendingChange, 'id'>;

  constructor() {
    super('KnowledgeDB');

    this.version(1).stores({
      files: 'id, name, *parents, mimeType, modifiedTime, *tags, *aliases, trashed',
      syncState: 'key',
    });

    this.version(2).stores({
      files: 'id, name, *parents, mimeType, modifiedTime, *tags, *aliases, trashed',
      syncState: 'key',
      pendingChanges: '++id, fileId, type, timestamp',
    });
  }
}
