# Schemas

This document outlines the database schemas used in the backend of the application. Each schema represents a different entity and its relationships with other entities.

## User

```sql
CREATE TABLE UserProfiles (
    user_id UUID REFERENCES Users(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    PRIMARY KEY (user_id)
);
```

## Document

```sql
CREATE TABLE Documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES Users(id),
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Docshare

**DO NOT IMPLEMENT YET. FOR FUTURE USE ONLY.**

```sql
CREATE TABLE Docshares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES Documents(id),
    shared_with_user_id UUID REFERENCES Users(id), -- Nullable for public shares
    permission_level VARCHAR(20) CHECK (permission_level IN ('read', 'write')),
    is_public BOOLEAN DEFAULT FALSE,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either user-specific OR public, not both
    CONSTRAINT check_share_type CHECK (
        (shared_with_user_id IS NOT NULL AND is_public = FALSE) OR
        (shared_with_user_id IS NULL AND is_public = TRUE)
    ),
    
    -- Prevent duplicate public shares for same document
    CONSTRAINT unique_public_share UNIQUE (document_id, is_public) 
        WHERE is_public = TRUE
);
```

