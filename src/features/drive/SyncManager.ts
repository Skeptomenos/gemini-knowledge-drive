import { db, type FileNode, type SyncState } from '@/lib/db';
import type { DriveFile, SyncProgress } from '@/types';
import {
  listFiles,
  fetchChanges,
  getStartPageToken,
  isMarkdownFile,
  isFolder,
} from './api';

type ProgressCallback = (progress: SyncProgress) => void;

function driveFileToFileNode(file: DriveFile): FileNode {
  return {
    id: file.id,
    name: file.name,
    parents: file.parents || [],
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime,
    version: parseInt(file.version || '0', 10),
    tags: [],
    aliases: [],
    trashed: file.trashed || false,
  };
}

export async function performFullSync(
  accessToken: string,
  driveId: string,
  onProgress?: ProgressCallback
): Promise<void> {
  onProgress?.({
    status: 'syncing',
    message: 'Starting full sync...',
    filesProcessed: 0,
    totalFiles: null,
    error: null,
  });

  const allFiles: FileNode[] = [];
  let pageToken: string | undefined;
  let pageCount = 0;

  do {
    const response = await listFiles(accessToken, driveId, pageToken);
    pageCount++;

    const fileNodes = response.files
      .filter((file) => isMarkdownFile(file) || isFolder(file))
      .map(driveFileToFileNode);

    allFiles.push(...fileNodes);

    onProgress?.({
      status: 'syncing',
      message: `Fetching files (page ${pageCount})...`,
      filesProcessed: allFiles.length,
      totalFiles: null,
      error: null,
    });

    pageToken = response.nextPageToken;
  } while (pageToken);

  onProgress?.({
    status: 'syncing',
    message: 'Writing to local database...',
    filesProcessed: allFiles.length,
    totalFiles: allFiles.length,
    error: null,
  });

  await db.transaction('rw', db.files, db.syncState, async () => {
    await db.files.clear();
    await db.files.bulkPut(allFiles);

    const startPageToken = await getStartPageToken(accessToken, driveId);

    const syncState: SyncState = {
      key: 'main',
      nextPageToken: startPageToken,
      lastSync: Date.now(),
      driveId,
      rootFolderId: driveId,
    };
    await db.syncState.put(syncState);
  });

  onProgress?.({
    status: 'success',
    message: `Synced ${allFiles.length} files`,
    filesProcessed: allFiles.length,
    totalFiles: allFiles.length,
    error: null,
  });
}

export async function performIncrementalSync(
  accessToken: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const syncState = await db.syncState.get('main');

  if (!syncState?.nextPageToken || !syncState.driveId) {
    throw new Error('No sync state found. Run full sync first.');
  }

  onProgress?.({
    status: 'syncing',
    message: 'Checking for changes...',
    filesProcessed: 0,
    totalFiles: null,
    error: null,
  });

  let pageToken = syncState.nextPageToken;
  let changesProcessed = 0;
  let newStartPageToken: string | undefined;

  do {
    const response = await fetchChanges(
      accessToken,
      syncState.driveId,
      pageToken
    );

    for (const change of response.changes) {
      if (change.removed || change.file?.trashed) {
        await db.files.delete(change.fileId);
      } else if (change.file) {
        if (isMarkdownFile(change.file) || isFolder(change.file)) {
          const fileNode = driveFileToFileNode(change.file);
          await db.files.put(fileNode);
        }
      }
      changesProcessed++;
    }

    onProgress?.({
      status: 'syncing',
      message: `Processing changes (${changesProcessed})...`,
      filesProcessed: changesProcessed,
      totalFiles: null,
      error: null,
    });

    if (response.newStartPageToken) {
      newStartPageToken = response.newStartPageToken;
    }
    pageToken = response.nextPageToken || '';
  } while (pageToken);

  if (newStartPageToken) {
    await db.syncState.update('main', {
      nextPageToken: newStartPageToken,
      lastSync: Date.now(),
    });
  }

  const totalFiles = await db.files.count();

  onProgress?.({
    status: 'success',
    message: `Sync complete. ${changesProcessed} changes, ${totalFiles} files total.`,
    filesProcessed: changesProcessed,
    totalFiles,
    error: null,
  });
}

export async function getSyncState(): Promise<SyncState | undefined> {
  return db.syncState.get('main');
}

export async function getFileCount(): Promise<number> {
  return db.files.count();
}

export async function clearDatabase(): Promise<void> {
  await db.transaction('rw', db.files, db.syncState, async () => {
    await db.files.clear();
    await db.syncState.clear();
  });
}
