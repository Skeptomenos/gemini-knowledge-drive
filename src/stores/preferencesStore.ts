import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User Preferences Store - Manages persistent user settings.
 * 
 * Persisted to localStorage with version number for migrations.
 * Spec Reference: specs/08_settings_and_preferences.md
 */

export type Theme = 'dark' | 'light' | 'system';
export type FontFamily = 'JetBrains Mono' | 'Fira Code' | 'Consolas' | 'system-ui';

interface UserPreferences {
  version: number;
  // Appearance
  theme: Theme;
  fontSize: number;
  fontFamily: FontFamily;
  // Editor
  autoSaveDelay: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
}

interface PreferencesActions {
  // Appearance
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: FontFamily) => void;
  // Editor
  setAutoSaveDelay: (delay: number) => void;
  setWordWrap: (enabled: boolean) => void;
  setMinimap: (enabled: boolean) => void;
  setLineNumbers: (enabled: boolean) => void;
  // Utility
  resetToDefaults: () => void;
}

export type PreferencesStore = UserPreferences & PreferencesActions;

const DEFAULT_PREFERENCES: UserPreferences = {
  version: 1,
  // Appearance
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  // Editor
  autoSaveDelay: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,

      // Appearance actions
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      setFontSize: (fontSize) => {
        // Clamp between 12-20px as per spec
        const clamped = Math.min(20, Math.max(12, fontSize));
        set({ fontSize: clamped });
      },

      setFontFamily: (fontFamily) => set({ fontFamily }),

      // Editor actions
      setAutoSaveDelay: (autoSaveDelay) => {
        // Clamp between 1-10 seconds as per spec
        const clamped = Math.min(10, Math.max(1, autoSaveDelay));
        set({ autoSaveDelay: clamped });
      },

      setWordWrap: (wordWrap) => set({ wordWrap }),

      setMinimap: (minimap) => set({ minimap }),

      setLineNumbers: (lineNumbers) => set({ lineNumbers }),

      // Utility
      resetToDefaults: () => {
        set(DEFAULT_PREFERENCES);
        applyTheme(DEFAULT_PREFERENCES.theme);
      },
    }),
    {
      name: 'gkd-preferences',
      version: 1,
      migrate: (persistedState, version) => {
        // Handle future migrations here
        if (version === 0) {
          // Migration from version 0 to 1
          return { ...DEFAULT_PREFERENCES, ...(persistedState as object) };
        }
        return persistedState as PreferencesStore;
      },
    }
  )
);

/**
 * Apply theme to document root.
 * Tailwind uses 'dark' class on <html> for dark mode.
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

/**
 * Initialize theme on app load.
 * Call this in main.tsx or App.tsx.
 */
export function initializeTheme(): void {
  const state = usePreferencesStore.getState();
  applyTheme(state.theme);
  
  // Listen for system theme changes when using 'system' preference
  if (state.theme === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (usePreferencesStore.getState().theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    });
  }
}
