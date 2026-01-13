interface FrontmatterTableProps {
  frontmatter: {
    tags?: string[];
    status?: string;
    aliases?: string[];
    [key: string]: unknown;
  };
}

export function FrontmatterTable({ frontmatter }: FrontmatterTableProps) {
  const { tags, status, aliases, ...rest } = frontmatter;

  const hasContent = tags?.length || status || aliases?.length || Object.keys(rest).length > 0;

  if (!hasContent) return null;

  return (
    <div className="mb-6 p-4 bg-gkd-surface rounded-lg border border-gkd-border">
      <table className="w-full text-sm">
        <tbody>
          {status && (
            <tr>
              <td className="py-1 pr-4 text-gkd-text-muted font-medium w-24">Status</td>
              <td className="py-1">
                <span className={getStatusClass(status)}>{status}</span>
              </td>
            </tr>
          )}
          {tags && tags.length > 0 && (
            <tr>
              <td className="py-1 pr-4 text-gkd-text-muted font-medium w-24">Tags</td>
              <td className="py-1 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gkd-accent/20 text-gkd-accent rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </td>
            </tr>
          )}
          {aliases && aliases.length > 0 && (
            <tr>
              <td className="py-1 pr-4 text-gkd-text-muted font-medium w-24">Aliases</td>
              <td className="py-1 text-gkd-text-muted">
                {aliases.join(', ')}
              </td>
            </tr>
          )}
          {Object.entries(rest).map(([key, value]) => (
            <tr key={key}>
              <td className="py-1 pr-4 text-gkd-text-muted font-medium w-24 capitalize">
                {key}
              </td>
              <td className="py-1">{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStatusClass(status: string): string {
  const lower = status.toLowerCase();
  
  if (lower === 'draft' || lower === 'wip') {
    return 'px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs';
  }
  if (lower === 'final' || lower === 'complete' || lower === 'done') {
    return 'px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs';
  }
  if (lower === 'archived' || lower === 'deprecated') {
    return 'px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs';
  }
  
  return 'px-2 py-0.5 bg-gkd-accent/20 text-gkd-accent rounded text-xs';
}
