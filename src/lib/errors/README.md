# Error System Usage Guide

This document describes how to use the unified error handling system in the TongueToQuill application.

## Overview

The error system provides:

- **AppError**: Base class for all application errors
- **getErrorMessage**: Utility to extract error messages safely
- **withRetry**: Utility to retry failed operations
- **displayError**: Utility to show errors to users
- **handleServiceError**: Generic API error handler

## Error Classes

All service errors extend the `AppError` base class:

- `AuthError` - Authentication and authorization errors
- `DocumentError` - Document operation errors
- `TemplateError` - Template loading errors
- `QuillmarkError` - Quillmark rendering errors (with optional diagnostic field)

### Creating Custom Errors

```typescript
import { AppError } from '$lib/errors';

type MyErrorCode = 'error_one' | 'error_two';

class MyServiceError extends AppError {
	code: MyErrorCode;

	constructor(code: MyErrorCode, message: string, statusCode?: number) {
		super(code, message, statusCode);
		this.name = 'MyServiceError';
		this.code = code;
	}
}
```

## Utilities

### getErrorMessage

Extract error messages from any error type:

```typescript
import { getErrorMessage } from '$lib/errors';

try {
	await someOperation();
} catch (err) {
	const message = getErrorMessage(err, 'Operation failed');
	console.error(message);
}
```

### withRetry

Retry operations that may fail transiently:

```typescript
import { withRetry } from '$lib/errors';

const result = await withRetry(() => fetchData(), {
	maxAttempts: 3,
	delay: 1000,
	backoff: 2,
	shouldRetry: (error) => error instanceof NetworkError
});
```

### displayError

Show errors to users via toast notifications:

```typescript
import { displayError } from '$lib/errors';

try {
	await saveDocument();
} catch (err) {
	displayError(err, toastStore, {
		duration: 5000
	});
}
```

## API Error Handling

Use `handleServiceError` in API routes:

```typescript
import { handleServiceError } from '$lib/server/utils/api';

export const GET: RequestHandler = async (event) => {
	try {
		// ... your logic
		return json(result);
	} catch (error) {
		return handleServiceError(error);
	}
};
```

This handler:

- Works with all `AppError` subclasses
- Extracts error code, message, and status code
- Provides consistent error responses
- Logs errors for debugging

## Benefits

1. **Type Safety**: All error codes are typed per service
2. **Consistency**: Uniform error structure across the application
3. **DRY**: Single implementation of common error patterns
4. **Maintainability**: Fix bugs in one place, benefit everywhere
5. **Extensibility**: Easy to add new error types

## Migration Notes

The old handlers `handleAuthError` and `handleDocumentError` have been removed. Use `handleServiceError` instead, which works with all error types.
