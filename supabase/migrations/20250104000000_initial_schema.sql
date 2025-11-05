-- Initial Database Schema
-- Creates Users and Documents tables with indexes and constraints

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    -- Foreign Key referencing the auth.users table.
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    email VARCHAR(255) NOT NULL UNIQUE,
    dodid_full VARCHAR(16) UNIQUE,
    profile JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for DODID lookups (where not null)
CREATE INDEX IF NOT EXISTS idx_users_dodid_full ON users(dodid_full) WHERE dodid_full IS NOT NULL;

-- Documents Table
-- Stores all document data including content
-- Uses PostgreSQL TOAST for efficient storage and retrieval
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_size_bytes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Enforce content size limit (0.5 MB = 524,288 bytes)
    CONSTRAINT check_content_size CHECK (content_size_bytes <= 524288)
);

-- Index for listing user's documents (optimized for owner_id + created_at queries)
CREATE INDEX IF NOT EXISTS idx_documents_owner_created ON documents(owner_id, created_at DESC);
