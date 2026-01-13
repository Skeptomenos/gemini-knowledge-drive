import { useLiveQuery } from 'dexie-react-hooks';
import { db, type FileNode } from '@/lib/db';
import { useUIStore } from '@/stores/uiStore';
import { FileItem } from './FileItem';
import { EmptyState, EmptyStateIcons } from '@/components/ui/EmptyState';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
}

function FileTreeNode({ node, depth }: FileTreeNodeProps) {
  const { expandedFolders, toggleFolder } = useUIStore();
  const isFolder = node.mimeType === FOLDER_MIME_TYPE;
  const isExpanded = expandedFolders.has(node.id);

  const children = useLiveQuery(
    () => {
      if (!isFolder || !isExpanded) return [];
      return db.files
        .where('parents')
        .equals(node.id)
        .and((f) => !f.trashed)
        .sortBy('name');
    },
    [node.id, isExpanded, isFolder],
    []
  );

  const handleToggle = () => {
    if (isFolder) {
      toggleFolder(node.id);
    }
  };

  return (
    <div>
      <FileItem
        node={node}
        depth={depth}
        isFolder={isFolder}
        isExpanded={isExpanded}
        onToggle={handleToggle}
      />
      {isFolder && isExpanded && children && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree() {
  const syncState = useLiveQuery(() => db.syncState.get('main'));
  const rootFolderId = syncState?.rootFolderId;

  const rootItems = useLiveQuery(
    () => {
      if (!rootFolderId) return [];
      return db.files
        .where('parents')
        .equals(rootFolderId)
        .and((f) => !f.trashed)
        .sortBy('name');
    },
    [rootFolderId],
    []
  );

  if (!syncState?.driveId) {
    return (
      <EmptyState
        icon={EmptyStateIcons.folder}
        title="No drive connected"
        description="Select a Shared Drive to get started with your knowledge base."
        variant="compact"
      />
    );
  }

  if (!rootItems || rootItems.length === 0) {
    return (
      <EmptyState
        icon={EmptyStateIcons.document}
        title="No markdown files found"
        description="This folder doesn't contain any .md files yet."
        variant="compact"
      />
    );
  }

  return (
    <div className="py-2">
      {rootItems.map((item) => (
        <FileTreeNode key={item.id} node={item} depth={0} />
      ))}
    </div>
  );
}
