# Implementation Master Plan: Gemini Knowledge Drive

## Overview
This document outlines the sequential execution plan for building the Gemini Knowledge Drive. Each run builds upon the previous one.

## Execution Order

### 1. [Run 1: Foundation & Auth](./runs/01_foundation_and_auth.md)
**Focus**: Boilerplate, Firebase, Google Identity.
**Deliverable**: A deployed app where you can log in and see a "Token Received" message.

### 2. [Run 2: The Data Engine](./runs/02_data_engine.md)
**Focus**: IndexedDB, Google Drive API Sync.
**Deliverable**: App silently syncs your Drive file list to the browser database.

### 3. [Run 3: Navigation & UI](./runs/03_navigation_and_ui.md)
**Focus**: Sidebar, Routing, File Tree.
**Deliverable**: You can click through folders and see the file structure of your Shared Drive.

### 4. [Run 4: Markdown Viewer](./runs/04_markdown_viewer.md)
**Focus**: Rendering, Wikilinks.
**Deliverable**: Clicking a file shows rendered Markdown. `[[Links]]` work.

### 5. [Run 5: Editor & Save](./runs/05_editor_and_save.md)
**Focus**: Monaco, Write-back.
**Deliverable**: You can edit files and changes are saved to Google Drive.

### 6. [Run 6: Graph & Search](./runs/06_graph_and_search.md)
**Focus**: Visualization, Search Indexing.
**Deliverable**: Graph view, Backlinks panel, Command Palette.

## Global Constraints
*   **Context Window**: All code generation must fit within 130k tokens.
*   **Safety**: Do not commit API keys (though Firebase/Google keys are generally public, handle with care).
*   **Style**: Strict TypeScript, Functional React, Tailwind CSS.
