import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import type { FileNode } from '@/lib/db';

interface FileItemProps {
  node: FileNode;
  depth: number;
  isFolder: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FileItem({
  node,
  depth,
  isFolder,
  isExpanded,
  onToggle,
}: FileItemProps) {
  const navigate = useNavigate();
  const { activeFileId, setActiveFileId } = useUIStore();
  const isActive = activeFileId === node.id;

  const handleClick = () => {
    if (isFolder) {
      onToggle();
    } else {
      setActiveFileId(node.id);
      navigate(`/file/${node.id}`);
    }
  };

  const getFileIcon = () => {
    if (isFolder) {
      return isExpanded ? '📂' : '📁';
    }
    if (node.name.endsWith('.md')) {
      return '📝';
    }
    return '📄';
  };

  const displayName = node.name.replace(/\.md$/, '');

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-2 py-1 flex items-center gap-2 text-sm transition-colors hover:bg-gkd-surface-hover ${
        isActive ? 'bg-gkd-accent/20 text-gkd-accent' : 'text-gkd-text'
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      title={node.name}
    >
      <span className="flex-shrink-0 w-4 text-center">{getFileIcon()}</span>
      <span className="truncate">{displayName}</span>
    </button>
  );
}
