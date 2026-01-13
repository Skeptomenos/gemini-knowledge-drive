import { type ReactNode } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useUIStore } from '@/stores/uiStore';

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel?: ReactNode;
  header?: ReactNode;
}

export function AppShell({ sidebar, main, rightPanel, header }: AppShellProps) {
  const { isSidebarOpen, isRightPanelOpen } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-gkd-bg text-gkd-text overflow-hidden">
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
