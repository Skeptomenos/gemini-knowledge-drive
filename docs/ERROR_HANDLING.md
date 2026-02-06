# Error Handling Guide

This document covers error handling patterns for Drivesidian.

## Centralized Error Handler

Use `src/lib/error-handler.ts` for consistent error handling. It provides:

- **Error categorization**: `auth`, `drive`, `sync`, `save`, `network`
- **Retry logic**: Exponential backoff for transient failures
- **User feedback**: Automatic toast notifications via `toastStore`
- **Global handlers**: Set up in `src/main.tsx` with `setupGlobalErrorHandlers()`

## Pattern

```typescript
import { handleError } from '@/lib/error-handler';

try {
  await riskyOperation();
} catch (error) {
  handleError(error, 'drive');
}
```

## User Feedback

- Use `toastStore` for transient notifications
- Use dedicated error components for persistent errors
- Log structured errors to console with context

## Offline Support

Network state is tracked in `networkStore`. Check `isOnline` before making API calls:

```typescript
const { isOnline } = useNetworkStore();
if (!isOnline) {
  // Queue operation or show offline message
}
```

For detailed error specifications, see `specs/10_error_handling_and_offline.md`.
