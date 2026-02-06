# Architecture Guide

This document covers the codebase structure, state management, and database patterns for Drivesidian.

## Feature-Based Organization

Each feature in `src/features/` is self-contained:

```
src/features/<feature>/
├── index.ts          # Barrel exports
├── ComponentName.tsx # React components
├── useFeature.ts     # Custom hooks
└── utils.ts          # Feature-specific logic
```

Features: `auth`, `drive`, `editor`, `graph`, `navigation`, `onboarding`, `search`, `viewer`

## Zustand Stores

Global state lives in `src/stores/`. The pattern separates concerns:

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `uiStore` | Ephemeral UI state (activeFileId, viewMode) | None |
| `preferencesStore` | User settings (theme, font size) | `persist` middleware |
| `toastStore` | Transient notifications | None |
| `networkStore` | Online/offline status | None |

**Rule**: Store only IDs and flags in Zustand. Large objects (file metadata, content) belong in IndexedDB.

## Database (Dexie.js)

IndexedDB is the local cache for Drive metadata.

**Access**: Import the singleton `db` from `@/lib/db`

**Schema**: Defined in `src/lib/db/schema.ts` with versioned migrations

**Key tables**:
- `files` - Drive file metadata
- `syncState` - Sync cursors and timestamps
- `pendingChanges` - Offline write queue

**Pattern**: All DB operations are async. Wrap in try/catch:

```typescript
const files = await db.files.where('parentId').equals(folderId).toArray();
```

## Import Conventions

- Use the `@/` path alias for all imports from `src/`
- Prefer named exports over default exports
- Import from barrel files: `import { useAuth } from '@/features/auth'`

## Component Patterns

- Functional components with named exports: `export function ComponentName() {}`
- Props interfaces defined inline or in the same file
- Logic extracted to hooks, not embedded in components

## Type Definitions

- Shared types: `src/types/index.ts`
- Feature-specific types: co-located in the feature folder
- Database types: exported from `@/lib/db`

For detailed specifications, see `specs/01_system_overview.md` and `specs/03_data_layer_and_caching.md`.
