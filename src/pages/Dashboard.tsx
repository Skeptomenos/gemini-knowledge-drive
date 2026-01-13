import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { DriveSelector } from '@/features/drive';
import { useSync } from '@/hooks/useSync';
import { AppShell } from '@/components/layout/AppShell';
import { Sidebar, Breadcrumbs } from '@/features/navigation';
import { MarkdownPreview } from '@/features/viewer';
import { useUIStore } from '@/stores/uiStore';

function Header() {
  const { user, logout, isGapiReady } = useAuth();
  const { toggleSidebar, isSidebarOpen } = useUIStore();

  return (
    <div className="px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1 text-gkd-text-muted hover:text-gkd-text transition-colors"
            title="Show Sidebar (Cmd+B)"
          >
            ☰
          </button>
        )}
        <h1 className="text-lg font-semibold">Gemini Knowledge Drive</h1>
        {isGapiReady && (
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
            Connected
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.picture}
              alt={user.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gkd-text-muted hidden sm:inline">
              {user.email}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="px-2 py-1 text-sm text-gkd-text-muted hover:text-gkd-text border border-gkd-border rounded transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function MainContent() {
  const { accessToken } = useAuth();
  const { progress, syncState, fileCount, startFullSync, startIncrementalSync, clearData } = useSync();
  const { activeFileId } = useUIStore();
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

  if (!hasSyncedBefore) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-gkd-surface rounded-lg p-6 border border-gkd-border">
          <h2 className="text-lg font-medium mb-4">Connect Your Knowledge Base</h2>
          <p className="text-sm text-gkd-text-muted mb-4">
            Select a Shared Drive containing your markdown files to get started.
          </p>

          {accessToken && (
            <>
              <div className="mb-4">
                <DriveSelector
                  accessToken={accessToken}
                  onSelect={setSelectedDriveId}
                  selectedDriveId={selectedDriveId}
                />
              </div>

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
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSync}
                disabled={isSyncing || !selectedDriveId}
                className="w-full px-4 py-2 bg-gkd-accent hover:bg-gkd-accent-hover text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Sync
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-gkd-border">
        <Breadcrumbs />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeFileId ? (
          <div className="max-w-3xl mx-auto">
            <MarkdownPreview fileId={activeFileId} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gkd-surface rounded-lg p-6 border border-gkd-border">
              <h2 className="text-lg font-medium mb-4">Knowledge Base Status</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gkd-text-muted">Files indexed:</span>
                  <span>{fileCount}</span>
                </div>
                {syncState?.lastSync && (
                  <div className="flex justify-between">
                    <span className="text-gkd-text-muted">Last sync:</span>
                    <span>{new Date(syncState.lastSync).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {progress.status !== 'idle' && (
                <div className="mt-4 p-3 rounded bg-gkd-bg">
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
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => accessToken && startIncrementalSync(accessToken)}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-gkd-accent hover:bg-gkd-accent-hover text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sync Changes
                </button>
                <button
                  onClick={handleClearData}
                  disabled={isSyncing}
                  className="px-4 py-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Disconnect
                </button>
              </div>
            </div>

            <p className="text-center text-gkd-text-muted text-sm">
              Select a file from the sidebar to view it
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const { setActiveFileId } = useUIStore();

  useEffect(() => {
    setActiveFileId(id ?? null);
  }, [id, setActiveFileId]);

  return (
    <AppShell
      header={<Header />}
      sidebar={<Sidebar />}
      main={<MainContent />}
    />
  );
}
