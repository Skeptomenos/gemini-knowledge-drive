# Implementation Run 5: The Editor (Monaco)

## 1. Goal
Add "Edit Mode". Integrate Monaco Editor, implement bidirectional syncing (content <-> editor), and handle saving back to Google Drive.

## 2. Dependencies
*   `@monaco-editor/react`
*   `lodash` (for debounce)

## 3. Files to Create

### Components
*   `src/components/editor/MonacoWrapper.tsx`: Wrapper for config/theme.
*   `src/components/workspace/Workspace.tsx`: Switcher between `MarkdownPreview` and `MonacoWrapper`.

### Logic
*   `src/lib/editor/autocomplete.ts`: Provider for `[[` trigger.

## 4. Key Logic

### Save Strategy
1.  **State**: `editorContent` in Zustand.
2.  **Debounce**: `const save = debounce(api.updateFile, 2000)`.
3.  **Dirty Flag**: When user types, set `isDirty = true`. When save completes, `isDirty = false`.
4.  **UI**: Show "Unsaved Changes" indicator if dirty.

### Wikilink Autocomplete
*   Register a `CompletionItemProvider` with Monaco.
*   Trigger characters: `['[']`.
*   `provideCompletionItems`:
    *   Check if previous char is `[`.
    *   Query Dexie: `db.files.toArray()`. (Performance note: Cache this list names-only in memory if possible).
    *   Return list of filenames.

## 5. Verification Steps
1.  Click "Edit" button. View swaps to Code Editor.
2.  Type text. "Saving..." appears in status bar. "Saved" appears after 2s.
3.  Reload page. Changes persist.
4.  Type `[[`. Dropdown of files appears.
