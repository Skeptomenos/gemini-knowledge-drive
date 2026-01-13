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

export { EmptyStateIcons } from './empty-state-icons';
