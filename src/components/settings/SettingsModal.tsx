import { useState, useEffect, useRef } from 'react';
import { usePreferencesStore, type Theme, type FontFamily } from '@/stores/preferencesStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'drive' | 'appearance' | 'editor' | 'shortcuts';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('drive');
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    theme, setTheme,
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    autoSaveDelay, setAutoSaveDelay,
    wordWrap, setWordWrap,
    minimap, setMinimap,
    lineNumbers, setLineNumbers
  } = usePreferencesStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-gkd-bg border border-gkd-border rounded-lg shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col border-b border-gkd-border bg-gkd-surface/50">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gkd-text">Settings</h2>
            <button 
              onClick={onClose}
              className="text-gkd-text-muted hover:text-gkd-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex px-6 gap-6 overflow-x-auto">
            {(['drive', 'appearance', 'editor', 'shortcuts'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab 
                    ? 'border-gkd-accent text-gkd-text' 
                    : 'border-transparent text-gkd-text-muted hover:text-gkd-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="bg-gkd-surface p-4 rounded-lg border border-gkd-border">
                <h3 className="text-sm font-medium text-gkd-text-muted mb-1">Active Shared Drive</h3>
                <p className="text-gkd-text font-mono">My Knowledge Base (Placeholder)</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => console.log('Switch Drive clicked')}
                  className="px-4 py-2 bg-gkd-surface hover:bg-gkd-border border border-gkd-border rounded text-gkd-text transition-colors"
                >
                  Switch Drive
                </button>
                <button 
                  onClick={() => console.log('Rebuild Index clicked')}
                  className="px-4 py-2 bg-gkd-surface hover:bg-gkd-border border border-gkd-border rounded text-gkd-text transition-colors"
                >
                  Rebuild Index
                </button>
              </div>

              <div className="text-sm text-gkd-text-muted">
                Last Sync: <span className="text-gkd-text">Just now (Placeholder)</span>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gkd-text">Theme</label>
                <div className="flex gap-2 bg-gkd-surface p-1 rounded-lg border border-gkd-border w-fit">
                  {(['dark', 'light', 'system'] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-1.5 rounded text-sm transition-colors capitalize ${
                        theme === t 
                          ? 'bg-gkd-accent text-white shadow-sm' 
                          : 'text-gkd-text-muted hover:text-gkd-text'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium text-gkd-text">Font Size</label>
                  <span className="text-sm text-gkd-text-muted">{fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="20" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gkd-surface rounded-lg appearance-none cursor-pointer accent-gkd-accent"
                />
                <div className="flex justify-between text-xs text-gkd-text-muted px-1">
                  <span>12px</span>
                  <span>20px</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gkd-text">Font Family</label>
                <select 
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  className="w-full px-3 py-2 bg-gkd-surface border border-gkd-border rounded text-gkd-text focus:outline-none focus:border-gkd-accent"
                >
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="Consolas">Consolas</option>
                  <option value="system-ui">System UI</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium text-gkd-text">Auto-save Delay</label>
                  <span className="text-sm text-gkd-text-muted">{autoSaveDelay}s</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={autoSaveDelay} 
                  onChange={(e) => setAutoSaveDelay(parseInt(e.target.value))}
                  className="w-full h-2 bg-gkd-surface rounded-lg appearance-none cursor-pointer accent-gkd-accent"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-gkd-text group-hover:text-gkd-text/80 transition-colors">Word Wrap</span>
                  <input 
                    type="checkbox" 
                    checked={wordWrap}
                    onChange={(e) => setWordWrap(e.target.checked)}
                    className="w-5 h-5 rounded border-gkd-border bg-gkd-surface text-gkd-accent focus:ring-gkd-accent focus:ring-offset-gkd-bg"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-gkd-text group-hover:text-gkd-text/80 transition-colors">Minimap</span>
                  <input 
                    type="checkbox" 
                    checked={minimap}
                    onChange={(e) => setMinimap(e.target.checked)}
                    className="w-5 h-5 rounded border-gkd-border bg-gkd-surface text-gkd-accent focus:ring-gkd-accent focus:ring-offset-gkd-bg"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-gkd-text group-hover:text-gkd-text/80 transition-colors">Line Numbers</span>
                  <input 
                    type="checkbox" 
                    checked={lineNumbers}
                    onChange={(e) => setLineNumbers(e.target.checked)}
                    className="w-5 h-5 rounded border-gkd-border bg-gkd-surface text-gkd-accent focus:ring-gkd-accent focus:ring-offset-gkd-bg"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="overflow-hidden rounded-lg border border-gkd-border">
              <table className="w-full text-sm text-left">
                <thead className="bg-gkd-surface text-gkd-text-muted font-medium">
                  <tr>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3 text-right">Shortcut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gkd-border">
                  {[
                    { action: 'Quick Open', shortcut: 'Cmd+K' },
                    { action: 'Toggle Edit Mode', shortcut: 'Ctrl+E' },
                    { action: 'Save', shortcut: 'Ctrl+S' },
                    { action: 'Toggle Sidebar', shortcut: 'Cmd+B' },
                    { action: 'Settings', shortcut: 'Cmd+,' },
                  ].map((item) => (
                    <tr key={item.action} className="hover:bg-gkd-surface/50 transition-colors">
                      <td className="px-4 py-3 text-gkd-text">{item.action}</td>
                      <td className="px-4 py-3 text-right">
                        <kbd className="px-2 py-1 bg-gkd-surface border border-gkd-border rounded text-xs text-gkd-text-muted font-mono">
                          {item.shortcut}
                        </kbd>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
