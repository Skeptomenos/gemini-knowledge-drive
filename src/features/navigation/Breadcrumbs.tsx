import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db, type FileNode } from '@/lib/db';
import { useUIStore } from '@/stores/uiStore';

export function Breadcrumbs() {
  const navigate = useNavigate();
  const { activeFileId, setActiveFileId, expandFolders } = useUIStore();

  const breadcrumbPath = useLiveQuery(
    async (): Promise<FileNode[]> => {
      if (!activeFileId) return [];

      const path: FileNode[] = [];
      let currentId: string | undefined = activeFileId;

      while (currentId) {
        const file: FileNode | undefined = await db.files.get(currentId);
        if (!file) break;

        path.unshift(file);

        const parentId: string | undefined = file.parents?.[0];
        if (!parentId) break;

        const syncState = await db.syncState.get('main');
        if (parentId === syncState?.rootFolderId) break;

        currentId = parentId;
      }

      return path;
    },
    [activeFileId],
    []
  );

  const handleClick = (file: FileNode, index: number) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

    if (isFolder) {
      const folderIds = breadcrumbPath.slice(0, index + 1).map((f) => f.id);
      expandFolders(folderIds);
    } else {
      setActiveFileId(file.id);
      navigate(`/file/${file.id}`);
    }
  };

  if (!breadcrumbPath || breadcrumbPath.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-gkd-text-muted">
        Select a file to view
      </div>
    );
  }

  return (
    <nav className="px-4 py-2 flex items-center gap-1 text-sm overflow-x-auto">
      {breadcrumbPath.map((file, index) => {
        const isLast = index === breadcrumbPath.length - 1;
        const displayName = file.name.replace(/\.md$/, '');

        return (
          <span key={file.id} className="flex items-center gap-1">
            <button
              onClick={() => handleClick(file, index)}
              className={`hover:text-gkd-accent transition-colors truncate max-w-[200px] ${
                isLast ? 'text-gkd-text font-medium' : 'text-gkd-text-muted'
              }`}
              title={file.name}
            >
              {displayName}
            </button>
            {!isLast && <span className="text-gkd-text-muted">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
