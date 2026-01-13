import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrphanFiles, getMostCitedFiles, type FileAnalytics } from './builder';

export function AnalyticsPanel() {
  const navigate = useNavigate();
  const [orphans, setOrphans] = useState<FileAnalytics[]>([]);
  const [mostCited, setMostCited] = useState<FileAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const [orphanData, citedData] = await Promise.all([
        getOrphanFiles(),
        getMostCitedFiles(10),
      ]);
      setOrphans(orphanData);
      setMostCited(citedData);
      setLoading(false);
    }
    loadAnalytics();
  }, []);

  const handleFileClick = (fileId: string) => {
    navigate(`/file/${fileId}`);
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gkd-text-muted">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="text-xs font-semibold text-gkd-text-muted uppercase tracking-wider mb-3">
          Most Cited ({mostCited.length})
        </h3>
        {mostCited.length === 0 ? (
          <p className="text-sm text-gkd-text-muted">No linked files yet.</p>
        ) : (
          <ul className="space-y-1">
            {mostCited.map((file) => (
              <li key={file.fileId}>
                <button
                  onClick={() => handleFileClick(file.fileId)}
                  className="w-full text-left text-sm text-gkd-text-muted hover:text-gkd-text transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{file.fileName}</span>
                  <span className="text-xs bg-gkd-surface px-1.5 py-0.5 rounded">
                    {file.backlinkCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gkd-text-muted uppercase tracking-wider mb-3">
          Orphan Files ({orphans.length})
        </h3>
        {orphans.length === 0 ? (
          <p className="text-sm text-gkd-text-muted">All files are linked!</p>
        ) : (
          <ul className="space-y-1 max-h-48 overflow-auto">
            {orphans.slice(0, 20).map((file) => (
              <li key={file.fileId}>
                <button
                  onClick={() => handleFileClick(file.fileId)}
                  className="w-full text-left text-sm text-gkd-text-muted hover:text-gkd-text transition-colors truncate"
                >
                  {file.fileName}
                </button>
              </li>
            ))}
            {orphans.length > 20 && (
              <li className="text-xs text-gkd-text-muted">
                +{orphans.length - 20} more...
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
