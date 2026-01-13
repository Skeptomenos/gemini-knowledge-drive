import { db, type FileNode } from '@/lib/db';

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface BacklinkInfo {
  fileId: string;
  fileName: string;
  context: string;
}

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

const FOLDER_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

export function extractWikilinks(content: string): string[] {
  const links: string[] = [];
  let match;
  
  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  
  return [...new Set(links)];
}

export async function buildGraphData(): Promise<GraphData> {
  const files = await db.files
    .where('mimeType')
    .equals('text/markdown')
    .and((f) => !f.trashed)
    .toArray();

  const filesByName = new Map<string, FileNode>();
  const filesByAlias = new Map<string, FileNode>();
  
  for (const file of files) {
    const baseName = file.name.replace(/\.md$/i, '').toLowerCase();
    filesByName.set(baseName, file);
    
    for (const alias of file.aliases) {
      filesByAlias.set(alias.toLowerCase(), file);
    }
  }

  const backlinkCounts = new Map<string, number>();
  const links: GraphLink[] = [];

  for (const file of files) {
    if (!file.contentSnippet) continue;
    
    const wikilinks = extractWikilinks(file.contentSnippet);
    
    for (const linkTarget of wikilinks) {
      const targetLower = linkTarget.toLowerCase();
      const targetFile = filesByName.get(targetLower) || filesByAlias.get(targetLower);
      
      if (targetFile && targetFile.id !== file.id) {
        links.push({
          source: file.id,
          target: targetFile.id,
        });
        
        backlinkCounts.set(
          targetFile.id, 
          (backlinkCounts.get(targetFile.id) || 0) + 1
        );
      }
    }
  }

  const folderColorMap = new Map<string, string>();
  let colorIndex = 0;

  const nodes: GraphNode[] = files.map((file) => {
    const parentId = file.parents[0] || 'root';
    
    if (!folderColorMap.has(parentId)) {
      folderColorMap.set(parentId, FOLDER_COLORS[colorIndex % FOLDER_COLORS.length]);
      colorIndex++;
    }

    const backlinkCount = backlinkCounts.get(file.id) || 0;
    
    return {
      id: file.id,
      name: file.name.replace(/\.md$/i, ''),
      val: Math.max(1, backlinkCount + 1),
      color: folderColorMap.get(parentId)!,
    };
  });

  return { nodes, links };
}

export async function buildLocalGraphData(
  centerFileId: string, 
  depth: number = 1
): Promise<GraphData> {
  const fullGraph = await buildGraphData();
  
  const connectedIds = new Set<string>([centerFileId]);
  
  for (let d = 0; d < depth; d++) {
    const currentIds = [...connectedIds];
    
    for (const link of fullGraph.links) {
      if (currentIds.includes(link.source)) {
        connectedIds.add(link.target);
      }
      if (currentIds.includes(link.target)) {
        connectedIds.add(link.source);
      }
    }
  }

  const nodes = fullGraph.nodes.filter((n) => connectedIds.has(n.id));
  const links = fullGraph.links.filter(
    (l) => connectedIds.has(l.source) && connectedIds.has(l.target)
  );

  return { nodes, links };
}

export async function getBacklinks(fileId: string): Promise<BacklinkInfo[]> {
  const targetFile = await db.files.get(fileId);
  if (!targetFile) return [];

  const targetName = targetFile.name.replace(/\.md$/i, '').toLowerCase();
  const targetAliases = targetFile.aliases.map((a) => a.toLowerCase());

  const allFiles = await db.files
    .where('mimeType')
    .equals('text/markdown')
    .and((f) => !f.trashed && f.id !== fileId)
    .toArray();

  const backlinks: BacklinkInfo[] = [];

  for (const file of allFiles) {
    if (!file.contentSnippet) continue;

    const wikilinks = extractWikilinks(file.contentSnippet);
    
    for (const linkTarget of wikilinks) {
      const linkLower = linkTarget.toLowerCase();
      
      if (linkLower === targetName || targetAliases.includes(linkLower)) {
        const contextMatch = file.contentSnippet.match(
          new RegExp(`.{0,50}\\[\\[${escapeRegex(linkTarget)}(?:\\|[^\\]]+)?\\]\\].{0,50}`, 'i')
        );
        
        backlinks.push({
          fileId: file.id,
          fileName: file.name.replace(/\.md$/i, ''),
          context: contextMatch ? `...${contextMatch[0]}...` : '',
        });
        break;
      }
    }
  }

  return backlinks;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface FileAnalytics {
  fileId: string;
  fileName: string;
  backlinkCount: number;
}

export async function getOrphanFiles(): Promise<FileAnalytics[]> {
  const files = await db.files
    .where('mimeType')
    .equals('text/markdown')
    .and((f) => !f.trashed)
    .toArray();

  const filesByName = new Map<string, FileNode>();
  const filesByAlias = new Map<string, FileNode>();
  
  for (const file of files) {
    const baseName = file.name.replace(/\.md$/i, '').toLowerCase();
    filesByName.set(baseName, file);
    
    for (const alias of file.aliases) {
      filesByAlias.set(alias.toLowerCase(), file);
    }
  }

  const linkedFileIds = new Set<string>();

  for (const file of files) {
    if (!file.contentSnippet) continue;
    
    const wikilinks = extractWikilinks(file.contentSnippet);
    
    for (const linkTarget of wikilinks) {
      const targetLower = linkTarget.toLowerCase();
      const targetFile = filesByName.get(targetLower) || filesByAlias.get(targetLower);
      
      if (targetFile && targetFile.id !== file.id) {
        linkedFileIds.add(targetFile.id);
      }
    }
  }

  return files
    .filter((f) => !linkedFileIds.has(f.id))
    .map((f) => ({
      fileId: f.id,
      fileName: f.name.replace(/\.md$/i, ''),
      backlinkCount: 0,
    }));
}

export async function getMostCitedFiles(limit: number = 10): Promise<FileAnalytics[]> {
  const files = await db.files
    .where('mimeType')
    .equals('text/markdown')
    .and((f) => !f.trashed)
    .toArray();

  const filesByName = new Map<string, FileNode>();
  const filesByAlias = new Map<string, FileNode>();
  
  for (const file of files) {
    const baseName = file.name.replace(/\.md$/i, '').toLowerCase();
    filesByName.set(baseName, file);
    
    for (const alias of file.aliases) {
      filesByAlias.set(alias.toLowerCase(), file);
    }
  }

  const backlinkCounts = new Map<string, number>();

  for (const file of files) {
    if (!file.contentSnippet) continue;
    
    const wikilinks = extractWikilinks(file.contentSnippet);
    
    for (const linkTarget of wikilinks) {
      const targetLower = linkTarget.toLowerCase();
      const targetFile = filesByName.get(targetLower) || filesByAlias.get(targetLower);
      
      if (targetFile && targetFile.id !== file.id) {
        backlinkCounts.set(
          targetFile.id, 
          (backlinkCounts.get(targetFile.id) || 0) + 1
        );
      }
    }
  }

  const fileMap = new Map(files.map((f) => [f.id, f]));

  return [...backlinkCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([fileId, count]) => ({
      fileId,
      fileName: fileMap.get(fileId)?.name.replace(/\.md$/i, '') || 'Unknown',
      backlinkCount: count,
    }));
}
