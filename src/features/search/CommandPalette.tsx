import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIndex, type SearchResultItem } from './indexer';
import { useUIStore } from '@/stores/uiStore';
import { EmptyState, EmptyStateIcons } from '@/components/ui/EmptyState';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { setActiveFileId } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchResults = searchIndex.search(query, 15);
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = useCallback((result: SearchResultItem) => {
    setActiveFileId(result.id);
    navigate(`/file/${result.id}`);
    onClose();
  }, [navigate, setActiveFileId, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [results, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-xl bg-gkd-bg border border-gkd-border rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gkd-border">
          <svg 
            className="w-5 h-5 text-gkd-text-muted mr-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-gkd-text placeholder-gkd-text-muted outline-none text-lg"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gkd-text-muted bg-gkd-surface rounded">
            ESC
          </kbd>
        </div>

        {results.length > 0 && (
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${
                  index === selectedIndex 
                    ? 'bg-gkd-accent/20 text-gkd-text' 
                    : 'text-gkd-text-muted hover:bg-gkd-surface'
                }`}
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.displayName}</div>
                  {result.path && (
                    <div className="text-xs text-gkd-text-muted truncate">{result.path}</div>
                  )}
                </div>
                <span className="text-xs text-gkd-text-muted">
                  {Math.round(result.score * 10) / 10}
                </span>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.search}
            title={`No results for "${query}"`}
            description="Try a different search term or check spelling."
            variant="compact"
          />
        )}

        {!query && (
          <div className="px-4 py-8 text-center text-gkd-text-muted">
            Type to search files by name, tags, or aliases
          </div>
        )}
      </div>
    </div>
  );
}
