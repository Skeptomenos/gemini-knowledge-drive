import { type ReactNode } from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  /** Icon to display (ReactNode, typically an SVG) */
  icon?: ReactNode;
  /** Main title text */
  title: string;
  /** Description text below the title */
  description?: string;
  /** Optional action button */
  action?: EmptyStateAction;
  /** Size variant - 'default' for full panels, 'compact' for inline use */
  variant?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState - Reusable component for displaying empty states throughout the app.
 * 
 * Used when:
 * - File tree has no markdown files
 * - Search returns no results
 * - Backlinks panel has no incoming links
 * - Graph view has no connections
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${isCompact ? 'py-4 px-3' : 'py-12 px-6'}
        ${className}
      `}
    >
      {icon && (
        <div
          className={`
            text-gkd-text-muted mb-3
            ${isCompact ? 'text-2xl' : 'text-4xl'}
          `}
        >
          {icon}
        </div>
      )}

      <h3
        className={`
          font-medium text-gkd-text
          ${isCompact ? 'text-sm' : 'text-base'}
        `}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`
            text-gkd-text-muted mt-1
            ${isCompact ? 'text-xs' : 'text-sm'}
            max-w-xs
          `}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={`
            mt-4 bg-gkd-accent hover:bg-gkd-accent-hover text-white rounded transition-colors
            ${isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          `}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export const EmptyStateIcons = {
  document: (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  search: (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  link: (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  ),
  graph: (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
      />
    </svg>
  ),
  folder: (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
};
