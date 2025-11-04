# Supabase Database Setup

This directory contains the database schema and migration files for the Tongue to Quill application. Instead of manually configuring tables on the Supabase website, you can use these migration files to standardize and version-control your database schema.

## Prerequisites

1. Install [the Supabase CLI](https://supabase.com/docs/guides/local-development):

   ```bash
   brew install supabase/tap/supabase
   ```

2. Sign up for a Supabase account at https://supabase.com if you haven't already

## Quick Start

### Option 1: Local Development with Supabase CLI

This is the recommended approach for development as it allows you to run a local Supabase instance with Docker.

1. **Start local Supabase instance:**

   ```bash
   supabase start
   ```

   This will start all Supabase services locally (PostgreSQL, API, Studio, etc.)

2. **The migrations will automatically run** when you start the local instance

3. **Access your local services:**
   - Supabase Studio: http://localhost:54323
   - API URL: http://localhost:54321
   - Database URL: postgresql://postgres:postgres@localhost:54322/postgres

4. **Update your `.env` file with local credentials:**
   ```env
   SUPABASE_URL=http://localhost:54321
   SUPABASE_PUBLISHABLE_KEY=<anon key from supabase start output>
   SUPABASE_SECRET_KEY=<service_role key from supabase start output>
   ```

### Option 2: Connect to Hosted Supabase Project

If you prefer to use a hosted Supabase project:

1. **Link your Supabase project:**

   ```bash
   supabase link --project-ref <your-project-ref>
   ```

   You can find your project ref in your Supabase project URL: `https://app.supabase.com/project/<project-ref>`

2. **Push migrations to your hosted database:**

   ```bash
   supabase db push
   ```

3. **Update your `.env` file with your project credentials:**
   ```env
   SUPABASE_URL=https://<your-project-ref>.supabase.co
   SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   SUPABASE_SECRET_KEY=<your-service-role-key>
   ```
   Find these keys in your Supabase Dashboard → Project Settings → API

## Database Schema

The initial migration (`20250104000000_initial_schema.sql`) creates:

### Users Table

Stores user identity and profile information:

- `id` (UUID, primary key)
- `email` (VARCHAR, unique, required)
- `dodid` (VARCHAR, optional, unique) - For military users
- `profile` (JSONB) - Flexible profile data
- `created_at`, `updated_at` (timestamps)

### Documents Table

Stores user documents with content:

- `id` (UUID, primary key)
- `owner_id` (UUID, foreign key to users)
- `name` (VARCHAR, required)
- `content` (TEXT, required)
- `content_size_bytes` (INTEGER, required)
- `created_at`, `updated_at` (timestamps)
- Constraint: Maximum content size of 0.5 MB (524,288 bytes)

## Creating New Migrations

When you need to make schema changes:

1. **Generate a new migration file:**

   ```bash
   supabase migration new <migration_name>
   ```

   Example: `supabase migration new add_document_tags`

2. **Edit the generated migration file** in `supabase/migrations/`

3. **Apply the migration:**
   - For local: `supabase migration up` (or restart with `supabase start`)
   - For hosted: `supabase db push`

## Common Commands

```bash
# Start local Supabase (includes applying migrations)
supabase start

# Stop local Supabase
supabase stop

# View migration status
supabase migration list

# Apply pending migrations
supabase migration up

# Create a new migration
supabase migration new <name>

# Push migrations to remote/hosted database
supabase db push

# Pull schema changes from remote database
supabase db pull

# Reset local database (WARNING: destroys data)
supabase db reset

# View local database credentials
supabase status
```

## Troubleshooting

### "Table already exists" errors

If you've manually created tables on Supabase and now want to use migrations:

1. **Option A: Start fresh** (if no important data):

   ```bash
   # For local
   supabase db reset

   # For hosted - you'll need to manually drop tables or create a new project
   ```

2. **Option B: Mark migrations as applied** (if tables match schema):
   ```bash
   supabase migration repair <migration_version> --status applied
   ```

### Missing environment variables

Make sure your `.env` file has:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
SUPABASE_SECRET_KEY=<your-service-role-key>
```

### Cannot connect to database

1. Check that Supabase is running: `supabase status`
2. Verify your connection credentials
3. For local dev, make sure Docker is running

## Best Practices

1. **Never manually modify the database schema** on the Supabase website - always use migrations
2. **Commit migration files to git** to keep schema changes version-controlled
3. **Test migrations locally first** before pushing to production
4. **Use descriptive migration names** that explain what changed
5. **Keep migrations small and focused** on one change at a time

## Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Schema Design Documentation

For detailed information about the database schema design and rationale, see:

- `prose/designs/backend/SCHEMAS.md` - Complete schema documentation
- `prose/designs/backend/SUPABASE_DATABASE_ADAPTER.md` - Database adapter design
