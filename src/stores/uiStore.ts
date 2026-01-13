import { create } from 'zustand';

/**
 * Sidebar mode determines what content is shown in the left panel.
 */
export type SidebarMode = 'explorer' | 'search' | 'starred';

/**
 * UI Store - Manages ephemeral UI state for the application.
 * 
 * This store handles:
 * - Active file selection (synced with URL via React Router)
 * - Folder expansion state in the file tree
 * - Sidebar visibility and mode
 * - Right panel visibility
 */
interface UIState {
  /** Currently selected file ID (null if none) */
  activeFileId: string | null;
  /** Set of expanded folder IDs in the file tree */
  expandedFolders: Set<string>;
  /** Whether the left sidebar is visible */
  isSidebarOpen: boolean;
  /** Current sidebar mode */
  sidebarMode: SidebarMode;
  /** Whether the right panel (graph/backlinks) is visible */
  isRightPanelOpen: boolean;
}

interface UIActions {
  /** Set the active file ID */
  setActiveFileId: (id: string | null) => void;
  /** Toggle a folder's expanded state */
  toggleFolder: (folderId: string) => void;
  /** Expand a specific folder */
  expandFolder: (folderId: string) => void;
  /** Collapse a specific folder */
  collapseFolder: (folderId: string) => void;
  /** Expand multiple folders at once (e.g., for revealing a file path) */
  expandFolders: (folderIds: string[]) => void;
  /** Toggle sidebar visibility */
  toggleSidebar: () => void;
  /** Set sidebar open state */
  setSidebarOpen: (open: boolean) => void;
  /** Set sidebar mode */
  setSidebarMode: (mode: SidebarMode) => void;
  /** Toggle right panel visibility */
  toggleRightPanel: () => void;
  /** Set right panel open state */
  setRightPanelOpen: (open: boolean) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  activeFileId: null,
  expandedFolders: new Set<string>(),
  isSidebarOpen: true,
  sidebarMode: 'explorer',
  isRightPanelOpen: false,

  // Actions
  setActiveFileId: (id) => set({ activeFileId: id }),

  toggleFolder: (folderId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return { expandedFolders: newExpanded };
    }),

  expandFolder: (folderId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      newExpanded.add(folderId);
      return { expandedFolders: newExpanded };
    }),

  collapseFolder: (folderId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      newExpanded.delete(folderId);
      return { expandedFolders: newExpanded };
    }),

  expandFolders: (folderIds) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolders);
      folderIds.forEach((id) => newExpanded.add(id));
      return { expandedFolders: newExpanded };
    }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  setSidebarMode: (mode) => set({ sidebarMode: mode }),

  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  setRightPanelOpen: (open) => set({ isRightPanelOpen: open }),
}));
