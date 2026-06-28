-- ==============================================================================
-- Chhayapoth Supabase Database Schema
-- Execute these SQL queries inside the Supabase SQL Editor to initialize.
-- ==============================================================================

-- 1. Create Authors Table
CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY, -- Syncs with Clerk User ID or Mock ID
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  bio TEXT,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (optional, for security)
-- ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- 2. Create Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  preview_image TEXT,
  author_id TEXT REFERENCES authors(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'General',
  read_time TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- 'published' or 'draft'
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (optional, for security)
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT 'Anonymous Reader',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (optional, for security)
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Create View Increment RPC Function
-- This function is invoked by our app to atomically increase page views
CREATE OR REPLACE FUNCTION increment_views(row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET views = views + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Create Increment Posts Count Function
CREATE OR REPLACE FUNCTION increment_posts_count(author_row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE authors
  SET posts_count = posts_count + 1
  WHERE id = author_row_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create Decrement Posts Count Function
CREATE OR REPLACE FUNCTION decrement_posts_count(author_row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE authors
  SET posts_count = GREATEST(0, posts_count - 1)
  WHERE id = author_row_id;
END;
$$ LANGUAGE plpgsql;
