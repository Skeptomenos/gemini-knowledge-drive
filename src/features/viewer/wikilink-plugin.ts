import type MarkdownIt from 'markdown-it';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';
import type Token from 'markdown-it/lib/token.mjs';

/**
 * Wikilink plugin for markdown-it.
 * 
 * Parses [[Link Name]] and [[Link Name|Display Text]] syntax.
 * Renders as <a> tags with data-wikilink attribute for client-side resolution.
 * 
 * Resolution happens at render time via click handler since markdown-it
 * is synchronous but IndexedDB lookups are async.
 */
export function wikilinkPlugin(md: MarkdownIt): void {
  md.inline.ruler.push('wikilink', wikilinkRule);
  md.renderer.rules.wikilink = wikilinkRenderer;
}

function wikilinkRule(state: StateInline, silent: boolean): boolean {
  const start = state.pos;
  const max = state.posMax;

  // Must start with [[
  if (state.src.charCodeAt(start) !== 0x5B /* [ */ ||
      state.src.charCodeAt(start + 1) !== 0x5B /* [ */) {
    return false;
  }

  // Find closing ]]
  let pos = start + 2;
  let found = false;

  while (pos < max - 1) {
    if (state.src.charCodeAt(pos) === 0x5D /* ] */ &&
        state.src.charCodeAt(pos + 1) === 0x5D /* ] */) {
      found = true;
      break;
    }
    pos++;
  }

  if (!found) {
    return false;
  }

  const content = state.src.slice(start + 2, pos);
  
  // Empty wikilink
  if (!content.trim()) {
    return false;
  }

  if (!silent) {
    const token = state.push('wikilink', 'a', 0);
    
    // Parse [[target|display]] or [[target]]
    const pipeIndex = content.indexOf('|');
    if (pipeIndex !== -1) {
      token.meta = {
        target: content.slice(0, pipeIndex).trim(),
        display: content.slice(pipeIndex + 1).trim(),
      };
    } else {
      token.meta = {
        target: content.trim(),
        display: content.trim(),
      };
    }
  }

  state.pos = pos + 2;
  return true;
}

function wikilinkRenderer(
  tokens: Token[],
  idx: number
): string {
  const token = tokens[idx];
  const { target, display } = token.meta as { target: string; display: string };

  // Encode target for use in data attribute
  const encodedTarget = target
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');

  // Render as anchor with data-wikilink for client-side resolution
  // The click handler in MarkdownPreview will query IndexedDB and navigate
  return `<a href="#" class="internal-link" data-wikilink="${encodedTarget}">${escapeHtml(display)}</a>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
