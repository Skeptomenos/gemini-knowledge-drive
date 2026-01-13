import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import DOMPurify from 'dompurify';
import { wikilinkPlugin } from './wikilink-plugin';

/**
 * Parsed markdown result containing HTML and frontmatter.
 */
export interface ParsedMarkdown {
  /** Sanitized HTML content */
  html: string;
  /** Parsed frontmatter data */
  frontmatter: {
    tags?: string[];
    status?: string;
    aliases?: string[];
    [key: string]: unknown;
  };
}

/**
 * Create a configured markdown-it instance.
 * 
 * Plugins:
 * - Custom wikilink plugin for [[Link]] syntax
 * - Built-in linkify for auto-linking URLs
 * - HTML enabled for embedded content
 */
function createMarkdownParser(): MarkdownIt {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
  });

  // Add custom wikilink plugin
  md.use(wikilinkPlugin);

  // Add anchor IDs to headers for ToC linking
  md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    const nextToken = tokens[idx + 1];
    
    if (nextToken && nextToken.type === 'inline' && nextToken.content) {
      // Generate slug from heading text
      const slug = nextToken.content
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      token.attrSet('id', slug);
    }
    
    return self.renderToken(tokens, idx, options);
  };

  // Task list support: [ ] and [x]
  md.renderer.rules.list_item_open = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    const nextToken = tokens[idx + 2]; // Skip list_item_open -> paragraph_open -> inline
    
    if (nextToken && nextToken.type === 'inline' && nextToken.content) {
      const content = nextToken.content;
      
      if (content.startsWith('[ ] ')) {
        token.attrSet('class', 'task-list-item');
        nextToken.content = `<input type="checkbox" disabled /> ${content.slice(4)}`;
        nextToken.children = null; // Force re-render
      } else if (content.startsWith('[x] ') || content.startsWith('[X] ')) {
        token.attrSet('class', 'task-list-item');
        nextToken.content = `<input type="checkbox" checked disabled /> ${content.slice(4)}`;
        nextToken.children = null;
      }
    }
    
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const lang = token.info.trim() || 'text';
    const code = escapeHtml(token.content);
    
    return `<div class="code-block-wrapper group relative">
      <div class="code-block-header flex items-center justify-between px-3 py-1 bg-gkd-bg/50 border-b border-gkd-border text-xs text-gkd-text-muted">
        <span>${lang}</span>
        <button class="copy-code-btn opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 hover:bg-gkd-surface rounded" data-code="${code.replace(/"/g, '&quot;')}">
          Copy
        </button>
      </div>
      <pre class="!mt-0 !rounded-t-none"><code class="language-${lang}">${code}</code></pre>
    </div>`;
  };

  return md;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Singleton parser instance
let parserInstance: MarkdownIt | null = null;

function getParser(): MarkdownIt {
  if (!parserInstance) {
    parserInstance = createMarkdownParser();
  }
  return parserInstance;
}

/**
 * Parse markdown content with frontmatter extraction.
 * 
 * @param content - Raw markdown string (may include YAML frontmatter)
 * @returns Parsed result with sanitized HTML and frontmatter data
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  // Extract frontmatter using gray-matter
  const { data: frontmatter, content: markdownBody } = matter(content);

  // Parse markdown to HTML
  const parser = getParser();
  const rawHtml = parser.render(markdownBody);

  // Sanitize HTML to prevent XSS
  const html = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['data-file-id', 'data-wikilink'], // Allow our custom attributes
    ADD_TAGS: ['input'], // Allow checkbox inputs for task lists
  });

  return {
    html,
    frontmatter: frontmatter as ParsedMarkdown['frontmatter'],
  };
}

/**
 * Extract all wikilinks from markdown content.
 * Useful for building the link graph.
 * 
 * @param content - Raw markdown string
 * @returns Array of link names (without [[ ]])
 */
export function extractWikilinks(content: string): string[] {
  const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match;

  while ((match = wikilinkRegex.exec(content)) !== null) {
    links.push(match[1].trim());
  }

  return links;
}
