-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE scoutbook;

-- Connect to scoutbook database and run the following:

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'scout')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert sample data (optional)
-- INSERT INTO users (email, password, role) VALUES 
-- ('player@example.com', '$2a$10$example_hashed_password', 'player'),
-- ('scout@example.com', '$2a$10$example_hashed_password', 'scout');