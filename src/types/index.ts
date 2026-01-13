export type { FileNode, SyncState } from '@/lib/db';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

export interface SyncProgress {
  status: SyncStatus;
  message: string;
  filesProcessed: number;
  totalFiles: number | null;
  error: Error | null;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime: string;
  version?: string;
  trashed?: boolean;
}

export interface DriveChange {
  fileId: string;
  removed: boolean;
  file?: DriveFile;
}

export interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface DriveChangesResponse {
  changes: DriveChange[];
  newStartPageToken?: string;
  nextPageToken?: string;
}

export interface SharedDrive {
  id: string;
  name: string;
}
