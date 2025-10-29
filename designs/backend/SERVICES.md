# Services
This document outlines the design and architecture of the services used in the Tonguetoquill application. It covers the various backend services, their interactions, and how they contribute to the overall functionality of the application.

## Authentication Context
Services receive authenticated user context through middleware that extracts and validates the JWT from the request. The authenticated user's ID is passed to service methods for authorization.

**Pattern:**
- Middleware validates JWT and extracts user ID
- User ID passed to service layer via context/parameter
- Services perform ownership/permission checks before operations

## Document Service
The Document service is responsible for managing user documents. It handles CRUD operations with authorization and validation.

### Core Methods

**`createDocument(userId: UUID, name: String, content: String): DocumentMetadata`**
- **Authorization**: User must be authenticated
- **Validation**:
  - `name`: Required, 1-255 characters, no leading/trailing whitespace
  - `content`: Required, max 524,288 bytes (0.5 MB)
- **Returns**: Document metadata (id, name, owner_id, size, timestamps)
- **Errors**: `ValidationError`, `ContentTooLargeError`

**`getDocumentMetadata(userId: UUID, documentId: UUID): DocumentMetadata`**
- **Authorization**: User must own the document
- **Returns**: Document metadata without content (id, name, owner_id, size, timestamps)
- **Query Optimization**: Selects only metadata fields; PostgreSQL TOAST automatically skips loading content
- **Errors**: `NotFoundError`, `UnauthorizedError`

**`getDocumentContent(userId: UUID, documentId: UUID): Document`**
- **Authorization**: User must own the document  
- **Returns**: Full document including content
- **Query Optimization**: Selects all fields; PostgreSQL TOAST fetches content when explicitly requested
- **Errors**: `NotFoundError`, `UnauthorizedError`

**`updateDocumentContent(userId: UUID, documentId: UUID, content: String): DocumentMetadata`**
- **Authorization**: User must own the document
- **Validation**: 
  - `content`: Required, max 524,288 bytes (0.5 MB)
- **Returns**: Updated document metadata
- **Errors**: `NotFoundError`, `UnauthorizedError`, `ValidationError`, `ContentTooLargeError`

**`updateDocumentName(userId: UUID, documentId: UUID, name: String): DocumentMetadata`**
- **Authorization**: User must own the document
- **Validation**: 
  - `name`: Required, 1-255 characters, no leading/trailing whitespace
- **Returns**: Updated document metadata
- **Errors**: `NotFoundError`, `UnauthorizedError`, `ValidationError`

**`deleteDocument(userId: UUID, documentId: UUID): void`**
- **Authorization**: User must own the document
- **Returns**: Nothing on success
- **Errors**: `NotFoundError`, `UnauthorizedError`

### List Methods

**`listUserDocuments(userId: UUID, limit: Integer, offset: Integer): List<DocumentMetadata>`**
- **Authorization**: User must be authenticated (lists own documents only)
- **Validation**:
  - `limit`: Optional, default 50, max 100
  - `offset`: Optional, default 0
- **Returns**: List of document metadata (id, name, owner_id, size, timestamps), ordered by created_at DESC
- **Query Optimization**: Selects only metadata fields; PostgreSQL TOAST ensures content is not loaded, providing efficient list rendering

### Performance Notes

Document queries are optimized through selective field selection:
- **Metadata queries** (list, getMetadata): Only SELECT non-content fields - TOAST automatically skips loading content
- **Full document queries** (getContent): SELECT all fields including content - TOAST fetches content as needed
- **Single table design**: Simplifies queries while maintaining optimal performance through PostgreSQL's automatic TOAST handling

### Error Types

**`NotFoundError`**: Requested document does not exist
- HTTP 404
- Message: "Document not found"

**`UnauthorizedError`**: User does not own the requested document
- HTTP 403  
- Message: "Not authorized to access this document"

**`ValidationError`**: Input validation failed
- HTTP 400
- Message: Specific validation failure (e.g., "Document name cannot be empty")

**`ContentTooLargeError`**: Document content exceeds size limit
- HTTP 413
- Message: "Document content exceeds maximum size of 0.5 MB"
