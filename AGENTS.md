# Agent Guide for Gemini Knowledge Drive

An "Obsidian for Google Drive" - a React SPA that mirrors Drive metadata to IndexedDB for instant navigation and wiki-link resolution.

## Stack
React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Monaco Editor, Dexie.js

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (localhost:5173) |
| `npm run build` | Type-check + production build. Run before completing any task. |
| `npm run lint` | ESLint checks |

No test suite exists. If asked to add tests, propose Vitest.

## Critical Rules

1. **Path alias**: Use `@/` for imports from `src/`
2. **No `any`**: Strict TypeScript throughout
3. **Tailwind v4**: Config is in `src/index.css` via `@theme`, not `tailwind.config.js`
4. **Build verification**: Always run `npm run build` after changes
5. **No secrets**: Never commit API keys or `.env` contents

## Detailed Guides

| Topic | Document |
|-------|----------|
| Architecture & patterns | `docs/ARCHITECTURE.md` |
| Styling & Tailwind v4 | `docs/STYLING.md` |
| Error handling | `docs/ERROR_HANDLING.md` |
| Authentication | `docs/AUTHENTICATION.md` |
| Deployment | `docs/DEPLOYMENT.md` |
| Feature specifications | `specs/` directory |

## Known Quirks

- `window.Buffer` is polyfilled in `main.tsx` for `gray-matter` - do not remove
- Build is ~900KB due to Monaco Editor - this is acceptable
- Google Auth scopes are in `src/lib/google-auth.ts`
