import { useRef, useEffect, useCallback } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import debounce from 'lodash/debounce';
import { useAuth } from '@/features/auth';
import { updateFileContent } from '@/features/drive/api';
import { useUIStore } from '@/stores/uiStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { registerWikilinkCompletion } from './autocomplete';

interface MonacoWrapperProps {
  fileId: string;
  initialContent: string;
  onContentChange?: (content: string) => void;
}

export function MonacoWrapper({ fileId, initialContent, onContentChange }: MonacoWrapperProps) {
  const { accessToken } = useAuth();
  const { setIsDirty, setSaveStatus } = useUIStore();
  const { fontSize, fontFamily, wordWrap, minimap, lineNumbers, autoSaveDelay } = usePreferencesStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const contentRef = useRef(initialContent);
  const fileIdRef = useRef(fileId);
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    fileIdRef.current = fileId;
  }, [fileId]);

  const saveToServer = useCallback(async (content: string) => {
    if (!accessToken) return;
    
    setSaveStatus('saving');
    try {
      await updateFileContent(accessToken, fileIdRef.current, content);
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  }, [accessToken, setSaveStatus, setIsDirty]);

  const autoSaveDelayMs = autoSaveDelay * 1000;

  useEffect(() => {
    debouncedSaveRef.current = debounce((content: string) => {
      saveToServer(content);
    }, autoSaveDelayMs);

    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [autoSaveDelayMs, saveToServer]);

  const handleChange: OnChange = useCallback((value) => {
    if (value === undefined) return;
    
    contentRef.current = value;
    setIsDirty(true);
    onContentChange?.(value);
    debouncedSaveRef.current?.(value);
  }, [setIsDirty, onContentChange]);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    registerWikilinkCompletion(monaco);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      debouncedSaveRef.current?.cancel();
      saveToServer(contentRef.current);
    });

    editor.focus();
  }, [saveToServer]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        defaultValue={initialContent}
        theme="vs-dark"
        onMount={handleMount}
        onChange={handleChange}
        options={{
          minimap: { enabled: minimap },
          wordWrap: wordWrap ? 'on' : 'off',
          fontFamily: fontFamily === 'system-ui' ? 'system-ui, sans-serif' : `'${fontFamily}', monospace`,
          fontSize: fontSize,
          lineNumbers: lineNumbers ? 'on' : 'off',
          renderWhitespace: 'selection',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
        }}
      />
    </div>
  );
}
