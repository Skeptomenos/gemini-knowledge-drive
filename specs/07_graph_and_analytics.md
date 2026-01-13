# Graph & Analytics Specification

## 1. The Graph View
**Library**: `react-force-graph-2d`
*   **Why?** WebGL support (can handle thousands of nodes smoothly), highly customizable.

## 2. Data Structure
*   **Nodes**: Files.
    *   Size: Based on number of backlinks (popularity).
    *   Color: Based on folder/category.
*   **Links**: Wikilinks.
    *   Directional arrows.

## 3. Visualization Features
*   **Global Graph**: Shows the entire Shared Drive.
    *   *Performance*: If > 2000 nodes, switch to static rendering or WebGL.
*   **Local Graph**: Shows only the current file and depth-1 or depth-2 connections.
    *   Displayed in the Right Panel.
*   **Interactive**:
    *   Click node -> Open file.
    *   Hover node -> Highlight connections.

## 4. Backlinks Panel
*   Located at the bottom of the rendered Markdown preview (like Obsidian).
*   **Logic**:
    *   Iterate all files in index.
    *   If File A links to File B, show File A in File B's "Linked Mentions".
*   **Context**: Show the snippet of text *surrounding* the link in File A.

## 5. Knowledge Analytics (Bonus)
*   **"Orphans"**: List files with 0 backlinks (candidates for cleanup or linking).
*   **"Most Cited"**: Top 10 files (Core knowledge).
