import MiniSearch, { type SearchResult } from 'minisearch';
import { db, type FileNode } from '@/lib/db';

export interface SearchDocument {
  id: string;
  name: string;
  displayName: string;
  tags: string;
  aliases: string;
  path: string;
}

export interface SearchResultItem extends SearchResult {
  id: string;
  name: string;
  displayName: string;
  path: string;
}

export class FileSearchIndex {
  private miniSearch: MiniSearch<SearchDocument>;
  private isBuilt = false;

  constructor() {
    this.miniSearch = new MiniSearch<SearchDocument>({
      fields: ['name', 'displayName', 'aliases', 'tags'],
      storeFields: ['id', 'name', 'displayName', 'path'],
      searchOptions: {
        boost: { displayName: 3, aliases: 2, tags: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  async buildIndex(): Promise<void> {
    const files = await db.files
      .where('mimeType')
      .equals('text/markdown')
      .and((f) => !f.trashed)
      .toArray();

    const documents = await Promise.all(
      files.map((file) => this.fileToDocument(file))
    );

    this.miniSearch.removeAll();
    this.miniSearch.addAll(documents);
    this.isBuilt = true;
  }

  async updateFile(file: FileNode): Promise<void> {
    if (file.mimeType !== 'text/markdown' || file.trashed) {
      this.removeFile(file.id);
      return;
    }

    const doc = await this.fileToDocument(file);
    
    if (this.miniSearch.has(file.id)) {
      this.miniSearch.discard(file.id);
    }
    
    this.miniSearch.add(doc);
  }

  removeFile(fileId: string): void {
    if (this.miniSearch.has(fileId)) {
      this.miniSearch.discard(fileId);
    }
  }

  search(query: string, limit = 20): SearchResultItem[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.miniSearch.search(query);
    return results.slice(0, limit) as SearchResultItem[];
  }

  suggest(query: string, limit = 10): SearchResultItem[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.miniSearch.search(query, {
      prefix: true,
      fuzzy: false,
    });
    return results.slice(0, limit) as SearchResultItem[];
  }

  get ready(): boolean {
    return this.isBuilt;
  }

  get documentCount(): number {
    return this.miniSearch.documentCount;
  }

  private async fileToDocument(file: FileNode): Promise<SearchDocument> {
    const displayName = file.name.replace(/\.md$/i, '');
    const path = await this.buildFilePath(file);

    return {
      id: file.id,
      name: file.name,
      displayName,
      tags: file.tags.join(' '),
      aliases: file.aliases.join(' '),
      path,
    };
  }

  private async buildFilePath(file: FileNode): Promise<string> {
    const pathParts: string[] = [];
    let currentParentId = file.parents[0];

    // max 10 levels to prevent infinite loops
    for (let i = 0; i < 10 && currentParentId; i++) {
      const parent = await db.files.get(currentParentId);
      if (!parent || parent.mimeType !== 'application/vnd.google-apps.folder') {
        break;
      }
      pathParts.unshift(parent.name);
      currentParentId = parent.parents[0];
    }

    return pathParts.join('/');
  }
}

export const searchIndex = new FileSearchIndex();
