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

The Documents table stores all document data including content.

```sql
CREATE TABLE Documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_size_bytes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Enforce content size limit (0.5 MB = 524,288 bytes)
    CONSTRAINT check_content_size CHECK (content_size_bytes <= 524288)
);

-- Index for listing user's documents
CREATE INDEX idx_documents_owner_created ON Documents(owner_id, created_at DESC);
```

**Design Rationale:**

- PostgreSQL's TOAST (The Oversized-Attribute Storage Technique) automatically stores large TEXT values out-of-line
- When queries select only metadata fields (id, name, dates, size), PostgreSQL skips loading the TOASTed content
- Content is only fetched when explicitly selected, providing the same performance benefits as manual table splitting
- Single table design simplifies queries, ensures atomic updates, and reduces complexity
- At 0.5MB limit, TOAST provides optimal performance without manual optimization
