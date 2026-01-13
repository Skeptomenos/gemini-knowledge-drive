import { useRef, useEffect, useCallback, useState } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import debounce from 'lodash/debounce';
import { useAuth } from '@/features/auth';
import { updateFileContent, getFileMetadata } from '@/features/drive/api';
import { useUIStore } from '@/stores/uiStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { registerWikilinkCompletion } from './autocomplete';

interface MonacoWrapperProps {
  fileId: string;
  initialContent: string;
  loadedModifiedTime: string | null;
  onContentChange?: (content: string) => void;
}

export function MonacoWrapper({ fileId, initialContent, loadedModifiedTime, onContentChange }: MonacoWrapperProps) {
  const { accessToken } = useAuth();
  const { setIsDirty, setSaveStatus } = useUIStore();
  const { fontSize, fontFamily, wordWrap, minimap, lineNumbers, autoSaveDelay } = usePreferencesStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const contentRef = useRef(initialContent);
  const fileIdRef = useRef(fileId);
  const loadedModifiedTimeRef = useRef(loadedModifiedTime);
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);

  useEffect(() => {
    fileIdRef.current = fileId;
  }, [fileId]);

  useEffect(() => {
    loadedModifiedTimeRef.current = loadedModifiedTime;
  }, [loadedModifiedTime]);

  const saveToServer = useCallback(async (content: string, forceOverwrite = false) => {
    if (!accessToken) return;
    
    setSaveStatus('saving');
    try {
      if (!forceOverwrite && loadedModifiedTimeRef.current) {
        const metadata = await getFileMetadata(accessToken, fileIdRef.current);
        const remoteTime = new Date(metadata.modifiedTime).getTime();
        const localTime = new Date(loadedModifiedTimeRef.current).getTime();
        
        if (remoteTime > localTime) {
          setPendingContent(content);
          setShowConflictDialog(true);
          setSaveStatus('idle');
          return;
        }
      }
      
      const result = await updateFileContent(accessToken, fileIdRef.current, content);
      loadedModifiedTimeRef.current = result.modifiedTime;
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveStatus('error');
    }
  }, [accessToken, setSaveStatus, setIsDirty]);

  const handleForceOverwrite = useCallback(() => {
    if (pendingContent !== null) {
      setShowConflictDialog(false);
      saveToServer(pendingContent, true);
      setPendingContent(null);
    }
  }, [pendingContent, saveToServer]);

  const handleReloadFile = useCallback(() => {
    setShowConflictDialog(false);
    setPendingContent(null);
    window.location.reload();
  }, []);

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
    <div className="h-full w-full relative">
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
      
      {showConflictDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gkd-surface border border-gkd-border rounded-lg p-6 max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gkd-text mb-2">
              File Changed on Server
            </h3>
            <p className="text-gkd-text-muted mb-4">
              This file has been modified by someone else since you started editing. 
              What would you like to do?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleReloadFile}
                className="px-4 py-2 text-sm rounded bg-gkd-border text-gkd-text hover:bg-gkd-border/80 transition-colors"
              >
                Reload File
              </button>
              <button
                onClick={handleForceOverwrite}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
