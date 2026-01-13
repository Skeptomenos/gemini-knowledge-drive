import { type ReactNode } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useUIStore } from '@/stores/uiStore';
import { useNetworkStore } from '@/stores/networkStore';

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel?: ReactNode;
  header?: ReactNode;
}

function OfflineBanner() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-black text-sm font-medium">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
      <span>You're offline. Changes will sync when connected.</span>
    </div>
  );
}

export function AppShell({ sidebar, main, rightPanel, header }: AppShellProps) {
  const { isSidebarOpen, isRightPanelOpen } = useUIStore();
  const { isOnline } = useNetworkStore();

  return (
    <div className="h-screen flex flex-col bg-gkd-bg text-gkd-text overflow-hidden">
      {!isOnline && <OfflineBanner />}
      {header && (
        <header className="flex-shrink-0 border-b border-gkd-border">
          {header}
        </header>
      )}

      <Group orientation="horizontal" className="flex-1">
        {isSidebarOpen && (
          <>
            <Panel
              id="sidebar"
              defaultSize="20%"
              minSize="15%"
              maxSize="40%"
              className="bg-gkd-surface"
            >
              {sidebar}
            </Panel>
            <Separator className="w-1 bg-gkd-border hover:bg-gkd-accent transition-colors cursor-col-resize" />
          </>
        )}

        <Panel id="main" minSize="30%" className="flex flex-col">
          {main}
        </Panel>

        {isRightPanelOpen && rightPanel && (
          <>
            <Separator className="w-1 bg-gkd-border hover:bg-gkd-accent transition-colors cursor-col-resize" />
            <Panel
              id="right-panel"
              defaultSize="25%"
              minSize="15%"
              maxSize="40%"
              className="bg-gkd-surface"
            >
              {rightPanel}
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
}
