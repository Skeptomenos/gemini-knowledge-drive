# Onboarding & Empty States Specification

## 1. Overview
Handle first-time user experience and gracefully display empty states throughout the application.

## 2. First-Time User Flow

### 2.1 Initial Landing
When user has no `syncState` in IndexedDB:

1. **Welcome Screen**:
   - Brief intro: "Welcome to Gemini Knowledge Drive"
   - Explain: "Connect your Google Shared Drive to create an interlinked knowledge base."
   - CTA: "Get Started" button.

2. **Drive Selection**:
   - Show available Shared Drives the user has access to.
   - Allow selection of root folder within a drive.
   - Explain: "We'll index all markdown files in this location."

3. **Initial Sync Progress**:
   - Full-screen progress indicator.
   - Show: "Indexing X files..." with count.
   - Estimated time remaining (if calculable).

4. **Completion**:
   - "Your knowledge base is ready!"
   - Auto-navigate to Dashboard with file tree visible.

## 3. Empty States

### 3.1 Empty File Tree
When selected drive/folder has no markdown files:

```
┌─────────────────────────────────────┐
│                                     │
│     📄 No markdown files found      │
│                                     │
│  This folder doesn't contain any    │
│  .md files yet.                     │
│                                     │
│  [Create your first note]           │
│                                     │
└─────────────────────────────────────┘
```

### 3.2 Empty Search Results
When Command Palette search returns nothing:

```
No results for "query"
Try a different search term or check spelling.
```

### 3.3 Empty Backlinks Panel
When current file has no incoming links:

```
No backlinks yet
Other files haven't linked to this note.
```

### 3.4 Empty Graph View
When no wikilinks exist in the knowledge base:

```
┌─────────────────────────────────────┐
│                                     │
│     🔗 No connections yet           │
│                                     │
│  Start linking notes with           │
│  [[wikilinks]] to see your          │
│  knowledge graph grow.              │
│                                     │
└─────────────────────────────────────┘
```

## 4. Tooltips & Hints
*   First time user opens editor: Tooltip explaining `[[` autocomplete.
*   First time user sees graph: Brief explanation of node/edge meaning.
*   Dismissable, stored in `localStorage` as `hints.dismissed[]`.

## 5. Implementation Notes
*   Create `src/components/ui/EmptyState.tsx` - reusable empty state component.
*   Create `src/features/onboarding/WelcomeFlow.tsx` - first-time wizard.
*   Store onboarding completion in `localStorage.onboardingComplete`.
