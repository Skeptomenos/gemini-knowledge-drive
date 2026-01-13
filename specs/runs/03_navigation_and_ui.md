# Implementation Run 3: Navigation & UI Shell

## 1. Goal
Build the visual structure of the application (Sidebar, File Tree, Breadcrumbs) and connect it to the Data Engine. Users should be able to navigate folders and select files.

## 2. Dependencies
*   `zustand`: State management.
*   `react-resizable-panels`: For adjustable sidebar width.

## 3. Files to Create

### State
*   `src/stores/uiStore.ts`:
    *   `isSidebarOpen`: bool.
    *   `activeFileId`: string | null.
    *   `expandedFolders`: Set<string>.
    *   Actions: `toggleFolder`, `selectFile`.

### Components
*   `src/components/layout/AppShell.tsx`: Main grid layout.
*   `src/components/layout/Sidebar.tsx`: Left panel container.
*   `src/components/explorer/FileTree.tsx`: Recursive folder renderer.
*   `src/components/explorer/FileItem.tsx`: Individual file row.
*   `src/components/layout/Breadcrumbs.tsx`: Path navigator.

## 4. Key Logic

### Recursive Tree Building
We need to turn the flat list from IndexedDB into a tree for the UI.
*   *Optimization*: Do **not** build the whole tree object in memory if possible.
*   *Better Approach*: The `FileTree` component takes a `parentId`. It queries Dexie: `useLiveQuery(() => db.files.where('parents').equals(parentId).toArray())`.
*   This allows lazy rendering. We only fetch children when a folder is expanded.

### "Open With" Handling
*   Modify `src/main.tsx` or `App.tsx` to parse URL params: `?state={...}`.
*   If `state.ids` exists (from Drive UI), immediately set `activeFileId` in the store.
*   This triggers the UI to highlight the file in the sidebar and (in next run) load content.

## 5. Verification Steps
1.  App shows a Sidebar.
2.  Sidebar lists root folders/files correctly.
3.  Clicking a folder toggles expansion (sub-files appear).
4.  Clicking a file highlights it and updates the URL (e.g., `/file/:id`).
5.  Drag sidebar handle resizes the pane.
