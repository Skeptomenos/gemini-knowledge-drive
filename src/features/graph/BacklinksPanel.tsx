import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBacklinks, type BacklinkInfo } from './builder';
import { useUIStore } from '@/stores/uiStore';

interface BacklinksPanelProps {
  fileId: string;
}

export function BacklinksPanel({ fileId }: BacklinksPanelProps) {
  const navigate = useNavigate();
  const { setActiveFileId } = useUIStore();
  const [backlinks, setBacklinks] = useState<BacklinkInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    async function loadBacklinks() {
      setLoading(true);
      try {
        const links = await getBacklinks(fileId);
        setBacklinks(links);
      } catch (error) {
        console.error('Failed to load backlinks:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBacklinks();
  }, [fileId]);

  const handleBacklinkClick = (backlinkFileId: string) => {
    setActiveFileId(backlinkFileId);
    navigate(`/file/${backlinkFileId}`);
  };

  if (loading) {
    return (
      <div className="border-t border-gkd-border mt-8 pt-4">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-4 bg-gkd-surface rounded" />
          <div className="h-4 w-24 bg-gkd-surface rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gkd-border mt-8 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gkd-text-muted hover:text-gkd-text transition-colors w-full"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm font-medium">
          Linked Mentions ({backlinks.length})
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {backlinks.length === 0 ? (
            <p className="text-sm text-gkd-text-muted pl-6">
              No other files link to this page
            </p>
          ) : (
            backlinks.map((backlink) => (
              <button
                key={backlink.fileId}
                onClick={() => handleBacklinkClick(backlink.fileId)}
                className="block w-full text-left pl-6 py-2 rounded hover:bg-gkd-surface transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gkd-text-muted group-hover:text-gkd-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gkd-text group-hover:text-gkd-accent">
                    {backlink.fileName}
                  </span>
                </div>
                {backlink.context && (
                  <p className="text-xs text-gkd-text-muted mt-1 line-clamp-2">
                    {backlink.context}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
