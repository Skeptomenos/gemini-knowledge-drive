# Styling Guide

This document covers Tailwind CSS v4 configuration and design tokens for Drivesidian.

## Tailwind CSS v4

**Important**: This project uses Tailwind v4. Configuration is in `src/index.css` via `@theme` blocks, not `tailwind.config.js`.

## Theme Tokens

Custom design tokens are defined as CSS variables:

```css
@theme {
  --color-gkd-bg: #0a0a0a;
  --color-gkd-surface: #121212;
  --color-gkd-border: #2a2a2a;
  /* ... */
}
```

Use these via Tailwind classes: `bg-gkd-bg`, `border-gkd-border`

## Dark Mode

Dark mode is the default. The `.dark` class on `<html>` activates dark theme variables.

## Typography

The `@tailwindcss/typography` plugin is used for rendered markdown. Apply the custom `.prose-gkd` class (defined in `src/index.css`) to markdown containers.

## Component Styling

- Use utility classes directly
- For complex conditional classes, use `clsx` or `tailwind-merge`
- Avoid inline styles

## Layout

The app uses `AppShell` (in `src/components/layout/`) with resizable panels:
- Sidebar (file tree)
- Main content area (editor/viewer)
- Right panel (backlinks, outline)

For design specifications, see `specs/04_ui_ux_design.md`.
