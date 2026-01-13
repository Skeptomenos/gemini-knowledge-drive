import { useState, useCallback, useEffect } from 'react';
import type { SyncProgress, SyncState } from '@/types';
import {
  performFullSync,
  performIncrementalSync,
  getSyncState,
  getFileCount,
  clearDatabase,
} from '@/features/drive/SyncManager';

interface UseSyncResult {
  progress: SyncProgress;
  syncState: SyncState | null;
  fileCount: number;
  startFullSync: (accessToken: string, driveId: string) => Promise<void>;
  startIncrementalSync: (accessToken: string) => Promise<void>;
  refreshState: () => Promise<void>;
  clearData: () => Promise<void>;
}

const initialProgress: SyncProgress = {
  status: 'idle',
  message: '',
  filesProcessed: 0,
  totalFiles: null,
  error: null,
};

export function useSync(): UseSyncResult {
  const [progress, setProgress] = useState<SyncProgress>(initialProgress);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [fileCount, setFileCount] = useState(0);

  const refreshState = useCallback(async () => {
    const state = await getSyncState();
    setSyncState(state || null);
    const count = await getFileCount();
    setFileCount(count);
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const startFullSync = useCallback(
    async (accessToken: string, driveId: string) => {
      try {
        await performFullSync(accessToken, driveId, setProgress);
        await refreshState();
      } catch (error) {
        setProgress({
          status: 'error',
          message: error instanceof Error ? error.message : 'Sync failed',
          filesProcessed: 0,
          totalFiles: null,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    },
    [refreshState]
  );

  const startIncrementalSync = useCallback(
    async (accessToken: string) => {
      try {
        await performIncrementalSync(accessToken, setProgress);
        await refreshState();
      } catch (error) {
        setProgress({
          status: 'error',
          message: error instanceof Error ? error.message : 'Sync failed',
          filesProcessed: 0,
          totalFiles: null,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    },
    [refreshState]
  );

  const clearData = useCallback(async () => {
    await clearDatabase();
    setProgress(initialProgress);
    await refreshState();
  }, [refreshState]);

  return {
    progress,
    syncState,
    fileCount,
    startFullSync,
    startIncrementalSync,
    refreshState,
    clearData,
  };
}
