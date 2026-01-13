import type { Monaco } from '@monaco-editor/react';
import type { editor, Position, languages } from 'monaco-editor';
import { db } from '@/lib/db';

let isRegistered = false;

export function registerWikilinkCompletion(monaco: Monaco): void {
  if (isRegistered) return;
  isRegistered = true;

  monaco.languages.registerCompletionItemProvider('markdown', {
    triggerCharacters: ['['],

    async provideCompletionItems(
      model: editor.ITextModel,
      position: Position
    ): Promise<languages.CompletionList> {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const wikilinkMatch = textUntilPosition.match(/\[\[([^\]]*)?$/);
      if (!wikilinkMatch) {
        return { suggestions: [] };
      }

      const searchTerm = wikilinkMatch[1] || '';
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column - searchTerm.length,
        endColumn: position.column,
      };

      const files = await db.files
        .where('mimeType')
        .notEqual('application/vnd.google-apps.folder')
        .toArray();

      const filtered = searchTerm
        ? files.filter((f) =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : files;

      const suggestions = filtered.slice(0, 50).map((file) => {
        const nameWithoutExt = file.name.replace(/\.md$/i, '');
        return {
          label: nameWithoutExt,
          kind: monaco.languages.CompletionItemKind.File,
          insertText: `${nameWithoutExt}]]`,
          range,
          detail: file.name,
          sortText: file.name.toLowerCase(),
        };
      });

      return { suggestions };
    },
  });
}
