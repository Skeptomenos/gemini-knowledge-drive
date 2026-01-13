import { create } from 'zustand';

/**
 * Sidebar mode determines what content is shown in the left panel.
 */
export type SidebarMode = 'explorer' | 'search' | 'starred';
export type ViewMode = 'read' | 'edit';

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
  activeFileId: string | null;
  expandedFolders: Set<string>;
  isSidebarOpen: boolean;
  sidebarMode: SidebarMode;
  isRightPanelOpen: boolean;
  viewMode: ViewMode;
  isDirty: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

interface UIActions {
  setActiveFileId: (id: string | null) => void;
  toggleFolder: (folderId: string) => void;
  expandFolder: (folderId: string) => void;
  collapseFolder: (folderId: string) => void;
  expandFolders: (folderIds: string[]) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  setIsDirty: (dirty: boolean) => void;
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  activeFileId: null,
  expandedFolders: new Set<string>(),
  isSidebarOpen: true,
  sidebarMode: 'explorer',
  isRightPanelOpen: false,
  viewMode: 'read',
  isDirty: false,
  saveStatus: 'idle',

  setActiveFileId: (id) => set({ activeFileId: id, viewMode: 'read', isDirty: false }),

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

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleViewMode: () => set((state) => ({ 
    viewMode: state.viewMode === 'read' ? 'edit' : 'read' 
  })),

  setIsDirty: (dirty) => set({ isDirty: dirty }),

  setSaveStatus: (status) => set({ saveStatus: status }),
}));
