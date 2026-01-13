import { useUIStore, type SidebarMode } from '@/stores/uiStore';
import { FileTree } from './FileTree';

const SIDEBAR_MODES: { mode: SidebarMode; label: string; icon: string }[] = [
  { mode: 'explorer', label: 'Explorer', icon: '📁' },
  { mode: 'search', label: 'Search', icon: '🔍' },
  { mode: 'starred', label: 'Starred', icon: '⭐' },
];

export function Sidebar() {
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
        {sidebarMode === 'search' && (
          <div className="p-4 text-gkd-text-muted text-sm">
            Search coming in Phase 6
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
          className="w-full text-left text-sm text-gkd-text-muted hover:text-gkd-text transition-colors flex items-center gap-2"
          title="Settings (Cmd+,)"
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
