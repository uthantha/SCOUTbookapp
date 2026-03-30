-- Add Google OAuth columns to existing users table
-- Run this in your PostgreSQL database (DBeaver or psql)

-- Connect to your postgres database first, then run:

-- Add new columns for Google OAuth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500),
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local' CHECK (auth_provider IN ('local', 'google'));

-- Make password nullable (for Google users who don't have passwords)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- Verify the changes
\d users;