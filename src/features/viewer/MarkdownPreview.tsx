import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getFileContent } from '@/features/drive/api';
import { db } from '@/lib/db';
import { parseMarkdown, type ParsedMarkdown } from './parser';
import { FrontmatterTable } from './FrontmatterTable';
import { BacklinksPanel } from '@/features/graph';

interface MarkdownPreviewProps {
  fileId: string;
}

type LoadingState = 'loading' | 'success' | 'error';

export function MarkdownPreview({ fileId }: MarkdownPreviewProps) {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<LoadingState>('loading');
  const [parsed, setParsed] = useState<ParsedMarkdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !fileId) return;

    let cancelled = false;

    async function fetchAndParse() {
      setState('loading');
      setError(null);

      try {
        const content = await getFileContent(accessToken!, fileId);
        if (cancelled) return;

        const result = parseMarkdown(content);
        setParsed(result);
        setState('success');

        // Lazy extraction: Update DB with frontmatter tags/aliases
        const { tags, aliases } = result.frontmatter;
        if (tags || aliases) {
          const updates: Partial<{ tags: string[]; aliases: string[] }> = {};
          if (tags && Array.isArray(tags)) {
            updates.tags = tags.map(String);
          }
          if (aliases && Array.isArray(aliases)) {
            updates.aliases = aliases.map(String).map(a => a.toLowerCase());
          }
          if (Object.keys(updates).length > 0) {
            await db.files.update(fileId, updates);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load file');
        setState('error');
      }
    }

    fetchAndParse();

    return () => {
      cancelled = true;
    };
  }, [accessToken, fileId]);

  const handleWikilinkClick = useCallback(
    async (target: string) => {
      const normalizedTarget = target.toLowerCase();

      
      const byName = await db.files
        .where('name')
        .equalsIgnoreCase(normalizedTarget + '.md')
        .first();

      if (byName) {
        navigate(`/file/${byName.id}`);
        return;
      }

      
      const byNameNoExt = await db.files
        .where('name')
        .equalsIgnoreCase(normalizedTarget)
        .first();

      if (byNameNoExt) {
        navigate(`/file/${byNameNoExt.id}`);
        return;
      }

      
      const byAlias = await db.files
        .where('aliases')
        .equals(normalizedTarget)
        .first();

      if (byAlias) {
        navigate(`/file/${byAlias.id}`);
        return;
      }

      
      const partialMatch = await db.files
        .filter((file) =>
          file.name.toLowerCase().includes(normalizedTarget) &&
          file.mimeType !== 'application/vnd.google-apps.folder'
        )
        .first();

      if (partialMatch) {
        navigate(`/file/${partialMatch.id}`);
        return;
      }

      console.warn(`Wikilink target not found: ${target}`);
    },
    [navigate]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      
      const link = target.closest('a[data-wikilink]');
      if (link) {
        e.preventDefault();
        const wikilinkTarget = link.getAttribute('data-wikilink');
        if (wikilinkTarget) {
          handleWikilinkClick(wikilinkTarget);
        }
        return;
      }

      const copyBtn = target.closest('.copy-code-btn') as HTMLElement;
      if (copyBtn) {
        e.preventDefault();
        const code = copyBtn.getAttribute('data-code') || '';
        const decoded = code
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
        navigator.clipboard.writeText(decoded);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      }
    }

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [handleWikilinkClick]);

  if (state === 'loading') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gkd-surface rounded w-3/4" />
        <div className="h-4 bg-gkd-surface rounded w-full" />
        <div className="h-4 bg-gkd-surface rounded w-5/6" />
        <div className="h-4 bg-gkd-surface rounded w-4/5" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!parsed) return null;

  const hasFrontmatter = Object.keys(parsed.frontmatter).length > 0;

  return (
    <div ref={containerRef} className="markdown-preview">
      {hasFrontmatter && <FrontmatterTable frontmatter={parsed.frontmatter} />}
      <div
        className="prose prose-invert prose-gkd max-w-none"
        dangerouslySetInnerHTML={{ __html: parsed.html }}
      />
      <BacklinksPanel fileId={fileId} />
    </div>
  );
}
