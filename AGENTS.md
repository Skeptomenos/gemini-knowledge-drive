# Agent Guide for Gemini Knowledge Drive

This document provides context, commands, and standards for AI agents working on this codebase.

## 1. Project Context
**Gemini Knowledge Drive (GKD)** is an internal Single Page Application (SPA) that functions as an "Obsidian for Google Drive".
*   **Core Logic**: It mirrors Google Drive metadata to a local IndexedDB (Dexie.js) to enable instant navigation and wiki-link resolution (`[[Link]]`).
*   **Backend**: Serverless. Google Drive API is the database; Firebase Hosting serves the assets.
*   **Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Monaco Editor.

## 2. Development Commands

| Command | Description | Notes |
| :--- | :--- | :--- |
| `npm run dev` | Start development server | Runs on `http://localhost:5173` |
| `npm run build` | Production build | Runs `tsc -b` (type check) then `vite build`. **ALWAYS** run this before declaring a task complete. |
| `npm run lint` | Run ESLint | Checks for code style and potential errors. |
| `npm run preview` | Serve build output | Test the production build locally. |

**Testing**: There is currently **NO** test suite configured. Do not attempt to run `npm test`. If asked to add tests, propose installing `vitest`.

## 3. Code Style & Standards

### TypeScript & React
*   **Strict Typing**: No `any`. Use interfaces for Props and State. Define types in `src/types/` or co-located with features if specific.
*   **Functional Components**: Use `export function ComponentName() {}`. Avoid `const ComponentName = () => {}`.
*   **Hooks**: Use custom hooks (`useSync`, `useAuth`) for logic reuse. Logic should generally live in `hooks/` or `stores/`, not components.
*   **Null Safety**: Handle `null`/`undefined` explicitly. Use optional chaining `?.` and nullish coalescing `??`.

### Styling (Tailwind CSS v4)
*   **Configuration**: Config is in `src/index.css` via `@theme` blocks, NOT `tailwind.config.js`.
*   **Dark Mode**: Default. Uses `.dark` class on `<html>`. Colors are defined as CSS variables (e.g., `--color-gkd-bg`).
*   **Classes**: Use utility classes. For complex components, use `clsx` or `tailwind-merge`.
*   **Typography**: We use `@tailwindcss/typography` with a custom class `.prose-gkd` defined in `src/index.css`.

### State Management (Zustand)
*   Global state lives in `src/stores/`.
*   Use `persist` middleware only for user preferences (theme, settings).
*   Avoid large objects in state; store metadata in IndexedDB (`db` instance) and only keep active IDs in Zustand.

### Database (Dexie.js)
*   **Schema**: Defined in `src/lib/db/schema.ts`.
*   **Access**: Import singleton `db` from `@/lib/db`.
*   **Async**: All DB operations are async. Handle `await` properly.

## 4. File Structure & Naming
*   **Path Alias**: Use `@/` to refer to `src/`. Example: `import { db } from '@/lib/db'`.
*   **Feature Folders**: `src/features/<feature>/` contains components, hooks, and logic for that domain (e.g., `auth`, `drive`, `editor`).
*   **Shared**: `src/components/ui/` for generic atoms (Buttons, Modals).
*   **Filenames**: `PascalCase.tsx` for components, `camelCase.ts` for logic/hooks.

## 5. Error Handling
*   **UI**: Use `toast` or specific error alert components for user feedback.
*   **Console**: Log structured errors with context.
*   **Boundaries**: Wrap critical features in Error Boundaries (though standard React ErrorBoundary is minimal currently).

## 6. Agent Protocol
1.  **Plan**: Before coding, read `specs/` or `IMPLEMENTATION_PLAN.md` if relevant to understand the architecture.
2.  **Verify**: After making changes, ALWAYS run `npm run build` to ensure type safety. Typescript errors are the most common failure mode.
3.  **Secrets**: NEVER commit secrets (API keys, Service Account JSONs). Use `.env` files.
4.  **Dependencies**: Prefer existing packages (`lodash`, `date-fns`) over installing new ones unless necessary.
5.  **Todos**: Use the `todowrite` tool to track progress on multi-file changes.

## 7. Known Issues / Quirks
*   **Buffer Polyfill**: `window.Buffer` is polyfilled in `src/main.tsx` to support `gray-matter`. Do not remove it.
*   **Large Build**: The build output is large (~900KB) due to Monaco Editor. This is known and accepted for an internal tool.
*   **Google Auth**: Requires specific scopes. See `src/lib/google-auth.ts`.
