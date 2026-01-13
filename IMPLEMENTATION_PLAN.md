# IMPLEMENTATION_PLAN.md - Gemini Knowledge Drive (GKD)

## Project Overview

**Gemini Knowledge Drive (GKD)** is a React 19 Single Page Application (SPA) that transforms a Google Shared Drive of markdown files into a cohesive, interlinked knowledge base ("Obsidian for Drive"). It uses the Google Drive API for storage and IndexedDB (Dexie.js) for high-performance local caching.

**Core Philosophy:**
- "Drive is the Backend" - No separate database. Truth lives in Drive.
- "Local is Fast" - Mirror metadata to browser's IndexedDB for sub-100ms navigation.
- "Markdown is King" - First-class support for GFM, Frontmatter, and Wiki-links.

**Status:** Phase 6 Complete - All core features implemented (Search, Graph, Backlinks).

---

## Source Directory Structure

```text
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Auth gate wrapper
├── index.css                   # Tailwind imports
├── vite-env.d.ts
│
├── components/                 # Shared generic UI components
│   ├── ui/                     # Button, Modal, Input, etc.
│   └── layout/                 # AppShell, ResizablePanel
│
├── features/                   # Feature-based modules
│   ├── auth/                   # Google OAuth logic
│   │   ├── AuthContext.tsx
│   │   ├── google-auth.ts
│   │   └── Login.tsx
│   │
│   ├── drive/                  # Drive API services, Sync Engine
│   │   ├── api.ts              # Drive API wrappers
│   │   ├── SyncManager.ts      # Full + Incremental sync
│   │   └── DriveSelector.tsx   # Shared Drive picker
│   │
│   ├── navigation/             # Sidebar, FileTree, Breadcrumbs
│   │   ├── Sidebar.tsx
│   │   ├── FileTree.tsx
│   │   ├── FileItem.tsx
│   │   └── Breadcrumbs.tsx
│   │
│   ├── viewer/                 # Markdown rendering, Wiki-link resolution
│   │   ├── MarkdownPreview.tsx
│   │   ├── parser.ts           # markdown-it config
│   │   ├── wikilink-plugin.ts  # Custom wikilink plugin
│   │   └── FrontmatterTable.tsx
│   │
│   ├── editor/                 # Monaco setup, Autosave logic
│   │   ├── MonacoWrapper.tsx
│   │   ├── autocomplete.ts     # Wikilink autocomplete provider
│   │   └── Workspace.tsx       # View/Edit toggle
│   │
│   ├── graph/                  # Force-graph views, Analytics
│   │   ├── GraphView.tsx
│   │   ├── builder.ts          # Nodes + Edges construction
│   │   └── BacklinksPanel.tsx
│   │
│   └── search/                 # Command palette, MiniSearch
│       ├── CommandPalette.tsx
│       └── indexer.ts
│
├── lib/                        # Core utilities
│   ├── db/
│   │   ├── schema.ts           # Dexie schema definitions
│   │   └── index.ts            # KnowledgeDB instance
│   ├── firebase.ts             # Firebase initialization
│   └── utils.ts                # Formatting helpers
│
├── stores/                     # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── fileStore.ts
│
├── hooks/                      # Custom React hooks
│   └── useSync.ts
│
├── pages/                      # Route pages
│   ├── Login.tsx
│   └── Dashboard.tsx
│
└── types/                      # TypeScript interfaces
    └── index.ts                # FileNode, SyncState, etc.
```

---

## Implementation Phases

### Phase 1: Foundation & Authentication
**Goal:** Initialize project, secure Google OAuth context, and deployment pipeline.
**Spec Reference:** `01_system_overview.md`, `02_auth_and_permissions.md`
**Run Reference:** `specs/runs/01_foundation_and_auth.md`

| Priority | Task | Files | Deliverable |
|----------|------|-------|-------------|
| P0 | Scaffold Vite + React 19 + TypeScript | `package.json`, `vite.config.ts`, `tsconfig.json` | `npm run dev` works |
| P0 | Configure Tailwind CSS + Dark Mode | `tailwind.config.js`, `postcss.config.js`, `src/index.css` | Dark theme active |
| P0 | Firebase Hosting setup | `firebase.json`, `.firebaserc` | `firebase deploy` works |
| P0 | Google Identity Services wrapper | `src/lib/google-auth.ts` | Script loading + token client |
| P0 | AuthContext provider | `src/features/auth/AuthContext.tsx` | `user`, `accessToken`, `login()`, `logout()` |
| P0 | Login page | `src/pages/Login.tsx` | "Sign in with Google" button |
| P0 | Protected Dashboard route | `src/pages/Dashboard.tsx`, `src/App.tsx` | Redirect if not authenticated |
| P1 | Path aliases (`@/*`) | `vite.config.ts`, `tsconfig.json` | Clean imports |

**Checkpoint:** User can login, see "Token Received" in console, `gapi.client.drive` available.

---

### Phase 2: Data Engine & Sync Core (CRITICAL PATH)
**Goal:** Build the "Brain". Connect to Drive, index files to Dexie.js, handle updates.
**Spec Reference:** `03_data_layer_and_caching.md`
**Run Reference:** `specs/runs/02_data_engine.md`

| Priority | Task | Files | Deliverable |
|----------|------|-------|-------------|
| P0 | Dexie schema definition | `src/lib/db/schema.ts` | `files`, `syncState` tables |
| P0 | KnowledgeDB instance | `src/lib/db/index.ts` | Singleton DB export |
| P0 | Drive API wrappers | `src/features/drive/api.ts` | `listFiles()`, `fetchChanges()`, `getFileContent()` |
| P0 | SyncManager - Full Sync | `src/features/drive/SyncManager.ts` | Recursive fetch all markdown/folders |
| P0 | SyncManager - Incremental Sync | `src/features/drive/SyncManager.ts` | `changes.list` delta updates |
| P0 | useSync hook | `src/hooks/useSync.ts` | Trigger sync on mount, expose status |
| P1 | Drive Selector UI | `src/features/drive/DriveSelector.tsx` | Select which Shared Drive to mount |
| P1 | Frontmatter extraction | `src/features/drive/SyncManager.ts` | Parse `tags`, `aliases` into DB |

**Checkpoint:** DevTools > Application > IndexedDB > `KnowledgeDB` shows Drive files.

---

### Phase 3: Navigation & UI Shell
**Goal:** Visualizing the data structure. The app starts looking like an IDE.
**Spec Reference:** `04_ui_ux_design.md`
**Run Reference:** `specs/runs/03_navigation_and_ui.md`

| Priority | Task | Files | Deliverable |
|----------|------|-------|-------------|
| P0 | Zustand UI store | `src/stores/uiStore.ts` | `activeFileId`, `expandedFolders`, `isSidebarOpen` |
| P0 | AppShell layout | `src/components/layout/AppShell.tsx` | Three-pane grid |
| P0 | Resizable panels | `src/components/layout/` | Draggable sidebar width |
| P0 | Sidebar container | `src/features/navigation/Sidebar.tsx` | Left panel with modes |
| P0 | FileTree component | `src/features/navigation/FileTree.tsx` | Recursive folder renderer |
| P0 | FileItem component | `src/features/navigation/FileItem.tsx` | Individual file row |
| P0 | React Router setup | `src/App.tsx` | Routes: `/`, `/file/:id` |
| P1 | Breadcrumbs | `src/features/navigation/Breadcrumbs.tsx` | Clickable path |
| P1 | "Open With" URL parsing | `src/App.tsx` | Handle `?state={...}` from Drive UI |
| P2 | Dark/Light mode toggle | `src/components/ui/ThemeToggle.tsx` | Tailwind class switching |

**Checkpoint:** Sidebar lists folders/files, clicking navigates, URL updates.

---

### Phase 4: Markdown Viewer & Link Resolution
**Goal:** Read-only mode with "Obsidian" flavor (Wikilinks).
**Spec Reference:** `05_markdown_rendering.md`
**Run Reference:** `specs/runs/04_markdown_viewer.md`

| Priority | Task | Files | Deliverable |
|----------|------|-------|-------------|
| P0 | markdown-it configuration | `src/features/viewer/parser.ts` | GFM, task-lists, front-matter, anchor |
| P0 | Wikilink plugin | `src/features/viewer/wikilink-plugin.ts` | Parse `[[Link]]` syntax |
| P0 | MarkdownPreview component | `src/features/viewer/MarkdownPreview.tsx` | Render markdown content |
| P0 | Content fetching logic | `src/features/viewer/MarkdownPreview.tsx` | Fetch from Drive on demand |
| P0 | Wikilink click handler | `src/features/viewer/MarkdownPreview.tsx` | Query DB, navigate to file |
| P1 | FrontmatterTable | `src/features/viewer/FrontmatterTable.tsx` | Display tags, status |
| P1 | Code syntax highlighting | `src/features/viewer/parser.ts` | shiki or highlight.js |
| P1 | Asset pipeline (images) | `src/features/viewer/` | Drive ID -> Blob -> ObjectURL |
| P2 | Copy-to-clipboard on code blocks | `src/features/viewer/` | Hover button |

**Checkpoint:** Clicking a file renders styled Markdown, wikilinks navigate correctly.

---

### Phase 5: Editor & Write Operations
**Goal:** Full creation capabilities.
**Spec Reference:** `06_editor_capabilities.md`
**Run Reference:** `specs/runs/05_editor_and_save.md`

| Priority | Task | Files | Deliverable |
|----------|------|-------|-------------|
| DONE | Monaco Editor wrapper | `src/features/editor/MonacoWrapper.tsx` | vs-dark theme, markdown lang |
| DONE | Workspace switcher | `src/features/editor/Workspace.tsx` | Toggle Read/Edit mode |
| DONE | Auto-save with debounce | `src/features/editor/MonacoWrapper.tsx` | 2s debounce, "Saving..." indicator |
| DONE | Manual save (Ctrl+S) | `src/features/editor/MonacoWrapper.tsx` | Immediate push |
| DONE | Wikilink autocomplete | `src/features/editor/autocomplete.ts` | `[[` trigger, file dropdown |
| P1 | Dirty state indicator | `src/stores/uiStore.ts` | "Unsaved Changes" UI |
| P1 | Concurrency detection | `src/features/editor/` | Check `modifiedTime` before save |
| P2 | Paste image upload | `src/features/editor/` | Upload to `assets/`, insert markdown |
| P2 | Prettier formatting | `src/features/editor/` | Shift+Alt+F |

**Checkpoint:** Edit files, changes auto-save to Drive, `[[` autocomplete works.

---

### Phase 6: Graph, Search & Analytics
**Goal:** The "Knowledge Base" power features.
**Spec Reference:** `07_graph_and_analytics.md`
**Run Reference:** `specs/runs/06_graph_and_search.md`

| Priority | Task | Files | Deliverable |
|----------|------|-------|-------------|
| P0 | MiniSearch integration | `src/features/search/indexer.ts` | Index filenames + tags |
| P0 | Command Palette | `src/features/search/CommandPalette.tsx` | Cmd+K, fuzzy file search |
| P0 | Graph data builder | `src/features/graph/builder.ts` | Files -> Nodes, Links -> Edges |
| P0 | GraphView component | `src/features/graph/GraphView.tsx` | react-force-graph-2d |
| P0 | Node click navigation | `src/features/graph/GraphView.tsx` | Click -> open file |
| P1 | BacklinksPanel | `src/features/graph/BacklinksPanel.tsx` | Files linking TO current file |
| P1 | Local graph (depth 1-2) | `src/features/graph/GraphView.tsx` | Right panel mini-graph |
| P2 | Orphan detection | `src/features/graph/` | List files with 0 backlinks |
| P2 | "Most Cited" analytics | `src/features/graph/` | Top 10 linked files |
| P2 | Outline (ToC) panel | `src/features/viewer/` | H1-H6 navigation |

**Checkpoint:** Cmd+K search works, graph view renders, backlinks panel populated.

---

## Identified Gaps & Missing Specs

### Gaps in Existing Specs:
1. **Drive Picker UI** - Spec 03 implies syncing starts, but no explicit UI for selecting which Shared Drive to mount initially. Added to Phase 2.
2. **Image/Asset Proxying** - Spec 05 mentions asset handling but doesn't detail the Blob URL conversion flow for private Drive images. Added to Phase 4.
3. **Conflict Resolution UI** - Spec 06 mentions concurrency handling but the UI for "Server version is newer" is undefined. Added to Phase 5 as P1.

### Missing Specs (NOW AUTHORED):
1. **`specs/08_settings_and_preferences.md`** - Settings modal for switching drives, toggling theme, clearing cache, keyboard shortcuts. **[CREATED]**
2. **`specs/09_onboarding_and_empty_states.md`** - First-time user experience, empty state handling, tutorial/walkthrough. **[CREATED]**
3. **`specs/10_error_handling_and_offline.md`** - Offline mode behavior, error boundaries, retry logic, user-facing error messages. **[CREATED]**

---

## Dependencies & Critical Path

```
Phase 1 (Auth) ──────────────────────────────────────────────────────────────►
                 │
                 ▼
Phase 2 (Data Engine) ◄── CRITICAL BLOCKER ──────────────────────────────────►
                 │
                 ├──────────────────────────────────────────────────────────►
                 ▼                                                           │
Phase 3 (Navigation UI) ─────────────────────────────────────────────────────►
                 │                                                           │
                 ▼                                                           │
Phase 4 (Markdown Viewer) ───────────────────────────────────────────────────►
                 │                                                           │
                 ▼                                                           │
Phase 5 (Editor) ────────────────────────────────────────────────────────────►
                 │                                                           │
                 ▼                                                           ▼
Phase 6 (Graph & Search) ◄── Depends on wikilink parsing from Phase 4 ──────►
```

**Critical Path:** Phase 2 (Data Engine) is the blocker. UI cannot be built without data, Editor cannot save without Sync engine.

---

## Execution Checkpoints

| Checkpoint | Phase | Verification |
|------------|-------|--------------|
| **CP1** | End of Phase 2 | Login works, IndexedDB shows Drive files in DevTools |
| **CP2** | End of Phase 4 | Browse knowledge base in read-only mode, wikilinks work |
| **CP3** | End of Phase 6 | Feature complete: edit, save, search, graph |

---

## Next Actions

1. [x] **Phase 1**: Scaffold project with Vite + React 19 + TypeScript
2. [x] **Phase 1**: Configure Tailwind CSS with dark mode
3. [x] **Phase 1**: Set up Firebase Hosting
4. [x] **Phase 1**: Implement Google OAuth flow
5. [x] **Phase 2**: Define Dexie schema and implement SyncManager
6. [x] **Phase 2**: Drive API wrappers (listFiles, fetchChanges, getFileContent)
7. [x] **Phase 2**: Full sync + Incremental sync implementation
8. [x] **Phase 2**: useSync hook and DriveSelector UI
9. [x] **Phase 3**: Navigation & UI Shell
   - Installed react-resizable-panels and zustand
   - Created uiStore.ts with activeFileId, expandedFolders, sidebar state
   - Created AppShell.tsx three-pane layout with resizable panels
   - Created Sidebar.tsx with Explorer/Search/Starred modes
   - Created FileTree.tsx recursive folder renderer using useLiveQuery
   - Created FileItem.tsx individual file/folder row component
   - Created Breadcrumbs.tsx clickable path component
   - Updated Dashboard.tsx to use AppShell layout
   - Wired up file navigation (clicking updates URL and activeFileId)
10. [x] **Phase 4**: Markdown Viewer & Link Resolution
    - Installed markdown-it, gray-matter, dompurify, shiki
    - Created parser.ts with markdown-it configuration (wikilinks, task-lists, anchors)
    - Created wikilink-plugin.ts for [[Link]] syntax parsing
    - Created MarkdownPreview.tsx with content fetching and wikilink click handling
    - Created FrontmatterTable.tsx for displaying tags/status/aliases
    - Added code block wrapper with copy-to-clipboard button
    - Wired MarkdownPreview into Dashboard replacing placeholder
11. [x] **Phase 5**: Editor & Write Operations
    - Installed @monaco-editor/react
    - Created MonacoWrapper.tsx with vs-dark theme and markdown support
    - Created Workspace.tsx for switching between View and Edit modes
    - Implemented auto-save with 2s debounce and manual save (Ctrl+S)
    - Implemented wikilink autocomplete provider for Monaco
12. [x] **Phase 6**: Graph, Search & Analytics
    - Installed minisearch and react-force-graph-2d
    - Created FileSearchIndex with MiniSearch for fuzzy file search
    - Created CommandPalette component with Cmd+K keyboard shortcut
    - Created graph data builder for extracting wikilinks and building graph
    - Created GraphView component with react-force-graph-2d
    - Created BacklinksPanel showing linked mentions
    - Wired up search and graph into Dashboard

---

*Generated: 2026-01-13*
*Updated: 2026-01-13*
*Status: Phase 6 Complete - All core features implemented*
