# Editor Capabilities Specification

## 1. The Editor Core
**Library**: `@monaco-editor/react`
*   This provides the exact experience of VS Code, which is familiar to the target audience (developers using Gemini CLI).

## 2. Configuration
*   **Theme**: `vs-dark`.
*   **Language**: `markdown`.
*   **Minimap**: Enabled.
*   **Word Wrap**: On.
*   **Font**: JetBrains Mono or Fira Code (if available), fallback to Consolas.

## 3. Enhanced Editing Features
*   **Wiki-link Autocomplete**:
    *   Trigger: User types `[[`.
    *   Action: Monaco `CompletionItemProvider` queries IndexedDB.
    *   Result: Dropdown of filenames.
*   **Paste Image**:
    *   Trigger: Ctrl+V (clipboard contains image).
    *   Action: 
        1.  Upload blob to `assets/` folder in Drive.
        2.  Insert `![filename](assets/filename.png)` at cursor.
*   **Prettier Formatting**:
    *   Trigger: Shift+Alt+F.
    *   Action: Runs `prettier` (client-side) to format the markdown table/lists.

## 4. Saving Strategy
*   **Auto-Save**:
    *   Mechanism: `lodash.debounce` (2000ms).
    *   Action: Push content to `files.update`.
    *   UI: "Saving..." -> "Saved" indicator in status bar.
*   **Manual Save**: Ctrl+S forces immediate push.

## 5. Concurrency Handling
*   **Problem**: Two users edit the same file.
*   **Solution (MVP)**: "Last Write Wins" (simplest).
*   **Solution (Better)**:
    *   Before save, check `modifiedTime`.
    *   If `remote.modifiedTime > local.loadTime`, alert user: "File has changed on server. Overwrite or Diff?".
    *   Show a simple Diff view.
