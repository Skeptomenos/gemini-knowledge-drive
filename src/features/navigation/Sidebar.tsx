import { useUIStore, type SidebarMode } from '@/stores/uiStore';
import { FileTree } from './FileTree';

const SIDEBAR_MODES: { mode: SidebarMode; label: string; icon: string }[] = [
  { mode: 'explorer', label: 'Explorer', icon: '📁' },
  { mode: 'graph', label: 'Graph', icon: '🕸️' },
  { mode: 'starred', label: 'Starred', icon: '⭐' },
];

interface SidebarProps {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { sidebarMode, setSidebarMode, toggleSidebar } = useUIStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gkd-border">
        <div className="flex gap-1">
          {SIDEBAR_MODES.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setSidebarMode(mode)}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                sidebarMode === mode
                  ? 'bg-gkd-accent text-white'
                  : 'text-gkd-text-muted hover:bg-gkd-surface-hover'
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 text-gkd-text-muted hover:text-gkd-text transition-colors"
          title="Hide Sidebar (Cmd+B)"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {sidebarMode === 'explorer' && <FileTree />}
        {sidebarMode === 'graph' && (
          <div className="p-4 text-gkd-text-muted text-sm">
            <p className="mb-2">Graph view is displayed in the main panel.</p>
            <p>Click on nodes to navigate to files.</p>
          </div>
        )}
        {sidebarMode === 'starred' && (
          <div className="p-4 text-gkd-text-muted text-sm">
            Starred files coming soon
          </div>
        )}
      </div>

      <div className="border-t border-gkd-border px-3 py-2">
        <button
          onClick={onOpenSettings}
          className="w-full text-left text-sm text-gkd-text-muted hover:text-gkd-text transition-colors flex items-center gap-2"
          title="Settings (Cmd+,)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  );
}
