# Implementation Run 4: Markdown Viewer & Wikilinks

## 1. Goal
Implement the read-only view. Fetch file content on demand, parse Markdown with GFM and Wikilink support, and render it.

## 2. Dependencies
*   `markdown-it`
*   `markdown-it-wikilinks` (or custom implementation)
*   `markdown-it-front-matter`
*   `gray-matter` (for robust parsing)
*   `dompurify` (Sanitization)

## 3. Files to Create

### Parsers
*   `src/lib/markdown/parser.ts`: Configure `markdown-it` instance.
*   `src/lib/markdown/wikilink-plugin.ts`: Custom plugin to resolve `[[Name]]` to `fileId`.

### Components
*   `src/components/viewer/MarkdownPreview.tsx`: The renderer.
*   `src/components/viewer/FrontmatterTable.tsx`: Display metadata (tags, status).

## 4. Key Logic

### Wikilink Resolution
This is the hardest part of the Viewer.
1.  **Plugin**: The markdown parser encounters `[[Project X]]`.
2.  **Lookup**: It cannot be async (markdown-it is synchronous).
3.  **Strategy**:
    *   Before rendering, we usually need a "pre-pass" or we rely on the `href` attribute being a special protocol.
    *   *Approach*: Render as `<a href="gkd://search/Project X" data-wikilink="Project X">`.
    *   **Click Handler**: Attach a global click listener to the Preview container.
    *   `onClick`: If target is internal link -> preventDefault -> Query DB for file with name "Project X" -> `uiStore.selectFile(id)`.

### Content Fetching
*   In `MarkdownPreview`, use `useEffect` on `activeFileId`.
*   Check `contentCache` (Zustand). If missing, call `drive.files.get(alt='media')`.
*   Show Skeleton loader while fetching.

## 5. Verification Steps
1.  Select a markdown file.
2.  Content loads and renders (Headers, Lists, Bold).
3.  Wikilinks appear as blue links.
4.  Clicking a Wikilink successfully jumps to the target file.
