# Implementation Run 6: Graph View & Advanced Search

## 1. Goal
Implement the "Obsidian" power user features: Force-directed graph view, Backlinks, and Command Palette search.

## 2. Dependencies
*   `react-force-graph-2d`
*   `minisearch`
*   `cmdk` (for Command Palette)

## 3. Files to Create

### Search
*   `src/components/search/CommandPalette.tsx`: Global modal.
*   `src/lib/search/indexer.ts`: Feeds Dexie data into MiniSearch.

### Graph
*   `src/components/graph/GraphView.tsx`: The visualization.
*   `src/lib/graph/builder.ts`: Logic to convert Files + Links into Nodes + Edges.

### Backlinks
*   `src/components/viewer/BacklinksPanel.tsx`.

## 4. Key Logic

### Graph Data Construction
1.  **Nodes**: Every file in IndexedDB.
2.  **Edges**: We need to parse *every* file to find links.
    *   *Problem*: We don't have content for all files locally (lazy fetch).
    *   *Compromise*: We can only graph files we have visited/cached OR we need to fetch all content (too slow).
    *   *Alternative*: Store "links" in a separate metadata field in IndexedDB.
    *   *Refinement for MVP*: Only graph relationships based on *folder structure* (Parents) initially, or parse content only when opened and store `outgoingLinks` array in IndexedDB metadata.
    *   *Decision*: Add `outgoingLinks` to `files` schema. Populate it when a file is opened/edited. Graph relies on this sparse data initially.

### Command Palette
*   Load on `Cmd+K`.
*   Search `db.files` by name.
*   Actions: "Go to File", "Toggle Dark Mode", "Reload Window".

## 5. Verification Steps
1.  Press `Cmd+K`. Search for a file. Enter navigates.
2.  Open Graph View. Nodes appear.
3.  Nodes are clickable.
