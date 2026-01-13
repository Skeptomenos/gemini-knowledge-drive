# UI/UX Design Specification

## 1. Layout: "The Knowledge Workspace"
A three-pane layout inspired by VS Code and Obsidian.

```
┌───┬────────────────────────────┬───────────┐
│ S │                            │           │
│ I │   [[ Breadcrumb / Path ]]  │    M      │
│ D │                            │    E      │
│ E │   +--------------------+   │    T      │
│ B │   |                    |   │    A      │
│ A │   |   Editor /         |   │           │
│ R │   |   Preview          |   │    P      │
│   │   |   Canvas           |   │    A      │
│   │   |                    |   │    N      │
│   │   |                    |   │    E      │
│   │   +--------------------+   │    L      │
│   │                            │           │
└───┴────────────────────────────┴───────────┘
```

## 2. Component Detail

### Left Sidebar (Navigation)
*   **File Tree**: Recursive component rendering the Folder/File structure from IndexedDB.
*   **Collapsible**: Can be hidden.
*   **States**:
    *   **Explorer**: Folder tree.
    *   **Search**: Global search results.
    *   **Starred**: Quick access.

### Center Stage (The Workspace)
*   **Tabs**: Multiple files open at once (stored in Zustand state).
*   **View Toggle**: Switch between "Read" (Markdown Preview) and "Edit" (Monaco) via Button or `Ctrl+E`.
*   **Breadcrumbs**: Clickable path `Shared Drive > Engineering > Specs > 04_ui.md`.

### Right Panel (Context)
*   **Graph (Local)**: Force-directed graph of the *current* node and its immediate neighbors (depth 1 or 2).
*   **Backlinks**: List of all files that link TO the current file.
*   **Outline**: Table of Contents generated from H1-H6 headers.

## 3. User Interactions
*   **Cmd+Click** on Wikilink: Opens in new tab/pane.
*   **Cmd+K**: Opens "Quick Open" modal (fuzzy search files).
*   **Drag & Drop**: Move files into folders (updates `parents` in Drive API).
*   **Dark Mode**: Default. toggleable.

## 4. "Open with" Integration States
*   **State A (Cold Boot)**: User opens file from Drive UI. App loads, syncs metadata, opens specific file ID requested.
*   **State B (In-App)**: User navigates via sidebar. No full page reload. Fast.
