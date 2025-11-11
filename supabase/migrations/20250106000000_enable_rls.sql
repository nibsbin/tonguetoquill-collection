-- Enable Row Level Security (RLS) for users and documents tables
-- No policies are created - all database interactions must go through the server
-- using service role credentials

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;