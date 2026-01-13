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
 * KnowledgeDB - Dexie database for local Drive metadata cache.
 * 
 * Tables:
 * - files: FileNode records indexed by id, name, parents, mimeType, modifiedTime
 * - syncState: Single SyncState record tracking sync progress
 */
export class KnowledgeDB extends Dexie {
  files!: EntityTable<FileNode, 'id'>;
  syncState!: EntityTable<SyncState, 'key'>;

  constructor() {
    super('KnowledgeDB');

    this.version(1).stores({
      // Primary key is 'id', with indexes on name, parents, mimeType, modifiedTime
      // Multi-entry index on parents and tags for array fields
      files: 'id, name, *parents, mimeType, modifiedTime, *tags, *aliases, trashed',
      // Primary key is 'key' (always "main")
      syncState: 'key',
    });
  }
}
