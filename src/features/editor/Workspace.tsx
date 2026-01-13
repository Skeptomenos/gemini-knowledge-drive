import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { getFileContentWithMetadata } from '@/features/drive/api';
import { useUIStore } from '@/stores/uiStore';
import { MarkdownPreview, OutlinePanel } from '@/features/viewer';
import { MonacoWrapper } from './MonacoWrapper';

interface WorkspaceProps {
  fileId: string;
}

type LoadingState = 'loading' | 'success' | 'error';

export function Workspace({ fileId }: WorkspaceProps) {
  const { accessToken } = useAuth();
  const { viewMode, toggleViewMode, isDirty, saveStatus } = useUIStore();
  
  const [loadState, setLoadState] = useState<LoadingState>('loading');
  const [content, setContent] = useState<string>('');
  const [loadedModifiedTime, setLoadedModifiedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !fileId) return;

    let cancelled = false;

    async function fetchContent() {
      setLoadState('loading');
      setError(null);

      try {
        const result = await getFileContentWithMetadata(accessToken!, fileId);
        if (cancelled) return;
        setContent(result.content);
        setLoadedModifiedTime(result.modifiedTime);
        setLoadState('success');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load file');
        setLoadState('error');
      }
    }

    fetchContent();

    return () => {
      cancelled = true;
    };
  }, [accessToken, fileId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      e.preventDefault();
      toggleViewMode();
    }
  }, [toggleViewMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  if (loadState === 'loading') {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-gkd-surface rounded w-3/4" />
        <div className="h-4 bg-gkd-surface rounded w-full" />
        <div className="h-4 bg-gkd-surface rounded w-5/6" />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gkd-border bg-gkd-surface">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleViewMode}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'read'
                ? 'bg-gkd-accent text-white'
                : 'text-gkd-text-muted hover:text-gkd-text'
            }`}
          >
            Read
          </button>
          <button
            onClick={toggleViewMode}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'edit'
                ? 'bg-gkd-accent text-white'
                : 'text-gkd-text-muted hover:text-gkd-text'
            }`}
          >
            Edit
          </button>
          <span className="text-xs text-gkd-text-muted">Ctrl+E</span>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-yellow-400">Unsaved changes</span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-xs text-gkd-text-muted flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-400">Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-400">Save failed</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {viewMode === 'read' ? (
          <>
            <div className="flex-1 h-full overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <MarkdownPreview fileId={fileId} />
              </div>
            </div>
            <div className="w-56 border-l border-gkd-border overflow-auto hidden lg:block">
              <OutlinePanel content={content} />
            </div>
          </>
        ) : (
          <MonacoWrapper
            fileId={fileId}
            initialContent={content}
            loadedModifiedTime={loadedModifiedTime}
            onContentChange={handleContentChange}
          />
        )}
      </div>
    </div>
  );
}
