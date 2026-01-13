# Settings & Preferences Specification

## 1. Overview
A centralized settings system for user preferences, drive configuration, and application behavior.

## 2. Settings Modal
Accessible via:
- Gear icon in sidebar footer
- `Cmd+,` keyboard shortcut

### Sections

#### 2.1 Drive Configuration
*   **Active Shared Drive**: Display current drive name/ID.
*   **Switch Drive**: Button to open Drive Picker and select a different Shared Drive.
*   **Rebuild Index**: Force a full re-sync (clears IndexedDB and performs Big Bang sync).
*   **Last Sync**: Timestamp of last successful sync.

#### 2.2 Appearance
*   **Theme**: Toggle between Dark / Light / System.
*   **Font Size**: Slider for editor and preview font size (12-20px).
*   **Font Family**: Dropdown (JetBrains Mono, Fira Code, Consolas, System).

#### 2.3 Editor
*   **Auto-save Delay**: Slider (1-10 seconds, default 2s).
*   **Word Wrap**: Toggle (default: on).
*   **Minimap**: Toggle (default: on).
*   **Line Numbers**: Toggle (default: on).

#### 2.4 Keyboard Shortcuts
*   Display list of available shortcuts.
*   Future: Allow customization.

| Action | Default Shortcut |
|--------|------------------|
| Quick Open | `Cmd+K` |
| Toggle Edit Mode | `Ctrl+E` |
| Save | `Ctrl+S` |
| Toggle Sidebar | `Cmd+B` |
| Settings | `Cmd+,` |

## 3. Persistence
*   **Storage**: `localStorage` for preferences (theme, font, etc.).
*   **Schema**: JSON object with version number for migrations.

```typescript
interface UserPreferences {
  version: number;
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  autoSaveDelay: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
}
```

## 4. Implementation Notes
*   Create `src/stores/preferencesStore.ts` (Zustand with localStorage persistence).
*   Settings modal component: `src/components/settings/SettingsModal.tsx`.
