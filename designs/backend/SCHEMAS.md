# Schemas

This document outlines the database schemas used in the backend of the application. Each schema represents a different entity and its relationships with other entities.

## Users

The Users table stores core identity information and flexible profile data.

```sql
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    dodid VARCHAR(10) NOT NULL UNIQUE,
    profile JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX idx_users_email ON Users(email);

-- Index for DODID lookups
CREATE INDEX idx_users_dodid ON Users(dodid);
```

**Profile JSONB Field:**
The `profile` field stores flexible user profile data that may evolve over time:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-15",
  "rank": "Captain",
  "unit": "123rd Squadron"
}
```

## Documents

Documents table stores document metadata separately from content for efficient listing.

```sql
CREATE TABLE Documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content_size_bytes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Enforce content size limit (0.5 MB = 524,288 bytes)
    CONSTRAINT check_content_size CHECK (content_size_bytes <= 524288)
);

-- Index for listing user's documents
CREATE INDEX idx_documents_owner_created ON Documents(owner_id, created_at DESC);

-- Index for owner lookups
CREATE INDEX idx_documents_owner ON Documents(owner_id);
```

## DocumentContent

Document content stored separately to optimize metadata queries.

```sql
CREATE TABLE DocumentContent (
    document_id UUID PRIMARY KEY REFERENCES Documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);
```

**Design Rationale:**
- Document listing queries fetch only metadata (id, name, dates, size) without loading content
- Content loaded individually only when user opens a specific document
- Improves performance for document list views in frontend

