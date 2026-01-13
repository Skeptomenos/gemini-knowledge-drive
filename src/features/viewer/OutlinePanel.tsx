import { useMemo } from 'react';
import { extractHeadings } from './outline-utils';

interface OutlinePanelProps {
  content: string;
}

export function OutlinePanel({ content }: OutlinePanelProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) {
    return (
      <div className="p-4 text-sm text-gkd-text-muted">
        No headings found in this document.
      </div>
    );
  }

  const handleClick = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const minLevel = Math.min(...headings.map(h => h.level));

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-gkd-text-muted uppercase tracking-wider mb-3">
        Outline
      </h3>
      <nav className="space-y-1">
        {headings.map((heading, index) => {
          const indent = (heading.level - minLevel) * 12;
          return (
            <button
              key={`${heading.slug}-${index}`}
              onClick={() => handleClick(heading.slug)}
              className="block w-full text-left text-sm text-gkd-text-muted hover:text-gkd-text transition-colors truncate"
              style={{ paddingLeft: `${indent}px` }}
              title={heading.text}
            >
              {heading.text}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
