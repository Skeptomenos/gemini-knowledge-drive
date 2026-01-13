import { toast } from '@/stores/toastStore';
import { markOfflineFromApiFailure } from '@/stores/networkStore';

export type ErrorCategory = 'auth' | 'drive' | 'sync' | 'save' | 'network' | 'unknown';

interface DriveApiError {
  code: number;
  message: string;
  status?: string;
}

interface ErrorContext {
  fileName?: string;
  operation?: string;
  retryFn?: () => Promise<void>;
}

export function calculateBackoff(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    onRetry?: (attempt: number, delay: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, onRetry } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = calculateBackoff(attempt);
        onRetry?.(attempt + 1, delay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function categorizeError(error: unknown): ErrorCategory {
  if (!error) return 'unknown';

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes('token') || message.includes('auth') || message.includes('401') || message.includes('consent')) {
    return 'auth';
  }
  if (message.includes('403') || message.includes('404') || message.includes('429') || message.includes('500') || message.includes('503')) {
    return 'drive';
  }
  if (message.includes('sync')) {
    return 'sync';
  }
  if (message.includes('save') || message.includes('write') || message.includes('update')) {
    return 'save';
  }
  if (message.includes('network') || message.includes('offline') || message.includes('fetch')) {
    return 'network';
  }

  return 'unknown';
}

export function extractDriveErrorCode(error: unknown): number | null {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as DriveApiError).code;
  }
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/\b(400|401|403|404|429|500|503)\b/);
  return match ? parseInt(match[1], 10) : null;
}

export function handleError(error: unknown, context: ErrorContext = {}): void {
  const category = categorizeError(error);
  const errorCode = extractDriveErrorCode(error);
  const message = error instanceof Error ? error.message : String(error);

  console.error(`[ErrorHandler] Category: ${category}, Code: ${errorCode}`, error);

  switch (category) {
    case 'auth':
      toast.error('Session expired. Please sign in again.');
      break;

    case 'drive':
      handleDriveError(errorCode, context);
      break;

    case 'sync':
      toast.warning(
        'Some files couldn\'t be synced.',
        context.retryFn ? { action: { label: 'Retry', onClick: context.retryFn } } : undefined
      );
      break;

    case 'save':
      handleSaveError(message, context);
      break;

    case 'network':
      markOfflineFromApiFailure();
      toast.warning('You\'re offline. Changes will sync when connected.');
      break;

    default:
      toast.error(
        context.operation
          ? `${context.operation} failed. Please try again.`
          : 'Something went wrong. Please try again.'
      );
  }
}

function handleDriveError(code: number | null, context: ErrorContext): void {
  switch (code) {
    case 403:
      toast.error(
        context.fileName
          ? `You don't have access to "${context.fileName}".`
          : 'You don\'t have access to this file.'
      );
      break;

    case 404:
      toast.error(
        context.fileName
          ? `"${context.fileName}" no longer exists.`
          : 'This file no longer exists.'
      );
      break;

    case 429:
      toast.warning('Too many requests. Retrying shortly...');
      break;

    case 500:
    case 503:
      toast.warning('Google Drive is temporarily unavailable. Retrying...');
      break;

    default:
      toast.error('Failed to access Google Drive.');
  }
}

function handleSaveError(message: string, context: ErrorContext): void {
  const fileName = context.fileName || 'file';

  if (message.includes('conflict') || message.includes('modified')) {
    toast.warning(
      `"${fileName}" was modified elsewhere.`,
      { action: { label: 'Reload', onClick: () => window.location.reload() } }
    );
  } else if (message.includes('network') || message.includes('offline')) {
    markOfflineFromApiFailure();
    toast.warning(
      `Couldn't save "${fileName}". Changes stored locally.`,
      context.retryFn ? { action: { label: 'Retry', onClick: context.retryFn } } : undefined
    );
  } else {
    toast.error(
      `Couldn't save "${fileName}".`,
      context.retryFn ? { action: { label: 'Retry', onClick: context.retryFn } } : undefined
    );
  }
}

export function setupGlobalErrorHandlers(): void {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    handleError(event.reason, { operation: 'Background operation' });
  });

  window.addEventListener('error', (event) => {
    console.error('[Uncaught Error]', event.error);
  });
}
