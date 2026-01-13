# Markdown Rendering & Logic

## 1. Parser Engine
**Core**: `markdown-it`
*   Why? Fast, compliant, massive plugin ecosystem.

## 2. Required Plugins
1.  **`markdown-it-wikilinks`**:
    *   **Custom Logic**: Must override the `generatePageNameFromUrl` to perform the ID lookup from our IndexedDB cache.
    *   **Syntax**: `[[Link Name]]` or `[[Link Name|Display Text]]`.
    *   **Behavior**: Renders `<a href="#" data-file-id="xyz" class="internal-link">`.
2.  **`markdown-it-task-lists`**:
    *   Renders `[ ]` and `[x]` as interactive checkboxes.
3.  **`markdown-it-front-matter`**:
    *   Parses YAML headers for tags/metadata.
4.  **`markdown-it-anchor`**:
    *   Adds IDs to headers for Table of Contents linking.
5.  **`markdown-it-footnote`**:
    *   Academic style referencing.

## 3. Code Highlighting
**Library**: `shiki` (if performance allows) or `highlight.js`.
*   **Target**: Since this is for a dev team using Gemini CLI, excellent code block rendering is critical.
*   **Features**: Copy-to-clipboard button on hover.

## 4. Asset Handling (Images)
*   **Problem**: Markdown image syntax `![Alt](image.png)` expects a public URL. Drive images are private.
*   **Solution**:
    *   **Regex Scan**: Identify all image tags.
    *   **Lookup**: Find file ID for `image.png` in the same folder (or `assets/` subfolder).
    *   **Fetch**: `files.get(alt='media')` to get a Blob.
    *   **Object URL**: Create `URL.createObjectURL(blob)` and swap the `src`.
    *   **Optimization**: Cache these object URLs heavily.

## 5. Frontmatter Handling
*   We will parse YAML frontmatter to extract:
    *   `tags`: For the search index.
    *   `status`: (e.g., "Draft", "Final").
    *   `aliases`: Alternative names for the file (for wikilink resolution).
