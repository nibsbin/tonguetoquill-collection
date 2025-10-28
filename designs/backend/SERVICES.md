# Services

This document outlines the design and architecture of the services used in the TongueToQuill application. It covers the various backend services, their interactions, and how they contribute to the overall functionality of the application.

## Login

## Document

The Document service is responsible for managing user documents. It handles CRUD operations.

### Core Methods

- `createDocument(ownerId: UUID, name: String, content: String): Document`
- `getDocument(documentId: UUID): Document`
- `updateDocument(documentId: UUID, content: String): Document`
- `deleteDocument(documentId: UUID): void`

### Helpers

- `listUserDocuments(userId: UUID): List<Document>`