import { usePreferencesStore, type Theme } from '@/stores/preferencesStore';

const THEME_ICONS: Record<Theme, string> = {
  dark: '🌙',
  light: '☀️',
  system: '💻',
};

export function ThemeToggle() {
  const { theme, setTheme } = usePreferencesStore();

  const cycleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-gkd-surface transition-colors text-gkd-text-muted hover:text-gkd-text"
      title={`Theme: ${theme} (click to cycle)`}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <span className="text-lg">{THEME_ICONS[theme]}</span>
    </button>
  );
}
