import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { DriveSelector } from '@/features/drive';
import { useSync } from '@/hooks/useSync';

export function Dashboard() {
  const { user, accessToken, logout, isGapiReady } = useAuth();
  const {
    progress,
    syncState,
    fileCount,
    startFullSync,
    startIncrementalSync,
    clearData,
  } = useSync();

  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);

  useEffect(() => {
    if (syncState?.driveId) {
      setSelectedDriveId(syncState.driveId);
    }
  }, [syncState?.driveId]);

  useEffect(() => {
    if (accessToken && syncState?.nextPageToken && syncState?.driveId) {
      startIncrementalSync(accessToken);
    }
  }, [accessToken, syncState?.nextPageToken, syncState?.driveId, startIncrementalSync]);

  const handleSync = async () => {
    if (!accessToken || !selectedDriveId) return;
    await startFullSync(accessToken, selectedDriveId);
  };

  const handleClearData = async () => {
    await clearData();
    setSelectedDriveId(null);
  };

  const isSyncing = progress.status === 'syncing';
  const hasSyncedBefore = !!syncState?.lastSync;

  return (
    <div className="min-h-screen bg-gkd-bg text-gkd-text">
      <header className="border-b border-gkd-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gemini Knowledge Drive</h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gkd-text-muted">{user.email}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm bg-gkd-surface hover:bg-gkd-surface-hover border border-gkd-border rounded transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gkd-surface rounded-lg p-6 border border-gkd-border">
            <h2 className="text-lg font-medium mb-4">System Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gkd-text-muted">Logged in as:</span>
                <span>{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gkd-text-muted">gapi.client.drive:</span>
                <span className={isGapiReady ? 'text-green-400' : 'text-red-400'}>
                  {isGapiReady ? 'Available' : 'Not Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gkd-text-muted">Files in cache:</span>
                <span>{fileCount}</span>
              </div>
              {syncState?.lastSync && (
                <div className="flex justify-between">
                  <span className="text-gkd-text-muted">Last sync:</span>
                  <span>{new Date(syncState.lastSync).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {accessToken && (
            <div className="bg-gkd-surface rounded-lg p-6 border border-gkd-border">
              <h2 className="text-lg font-medium mb-4">Drive Sync</h2>

              {!hasSyncedBefore && (
                <div className="mb-4">
                  <DriveSelector
                    accessToken={accessToken}
                    onSelect={setSelectedDriveId}
                    selectedDriveId={selectedDriveId}
                  />
                </div>
              )}

              {hasSyncedBefore && syncState?.driveId && (
                <div className="mb-4 text-sm">
                  <span className="text-gkd-text-muted">Connected to: </span>
                  <span className="font-medium">{syncState.driveId}</span>
                </div>
              )}

              {progress.status !== 'idle' && (
                <div className="mb-4 p-3 rounded bg-gkd-bg">
                  <div className="flex items-center gap-2">
                    {isSyncing && (
                      <div className="w-4 h-4 border-2 border-gkd-accent border-t-transparent rounded-full animate-spin" />
                    )}
                    <span
                      className={
                        progress.status === 'error'
                          ? 'text-red-400'
                          : progress.status === 'success'
                          ? 'text-green-400'
                          : 'text-gkd-text'
                      }
                    >
                      {progress.message}
                    </span>
                  </div>
                  {progress.filesProcessed > 0 && (
                    <div className="mt-1 text-sm text-gkd-text-muted">
                      {progress.filesProcessed} files processed
                      {progress.totalFiles && ` / ${progress.totalFiles} total`}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={isSyncing || !selectedDriveId}
                  className="px-4 py-2 bg-gkd-accent hover:bg-gkd-accent-hover text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasSyncedBefore ? 'Rebuild Index' : 'Start Sync'}
                </button>

                {hasSyncedBefore && (
                  <button
                    onClick={() => accessToken && startIncrementalSync(accessToken)}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-gkd-surface hover:bg-gkd-surface-hover border border-gkd-border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sync Changes
                  </button>
                )}

                {hasSyncedBefore && (
                  <button
                    onClick={handleClearData}
                    disabled={isSyncing}
                    className="px-4 py-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Cache
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-center text-gkd-text-muted text-sm">
            Phase 2 - Data Engine & Sync Core
          </p>
        </div>
      </main>
    </div>
  );
}
