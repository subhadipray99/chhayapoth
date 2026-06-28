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

-- 2. Create Series/Spaces Table
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  type TEXT DEFAULT 'blog', -- 'series' | 'blog' | 'single'
  author_id TEXT REFERENCES authors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for Spaces creation flow
ALTER TABLE series DISABLE ROW LEVEL SECURITY;

-- 3. Create Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT, -- Nullable for 'single' post types
  excerpt TEXT,
  content TEXT NOT NULL,
  preview_image TEXT,
  author_id TEXT REFERENCES authors(id) ON DELETE CASCADE,
  series_id TEXT REFERENCES series(id) ON DELETE SET NULL,
  episode_number INTEGER,
  genres TEXT DEFAULT 'Random',
  category TEXT DEFAULT 'General',
  read_time TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- 'published' or 'draft'
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT 'Anonymous Reader',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create View Increment RPC Function
-- This function is invoked by our app to atomically increase page views
CREATE OR REPLACE FUNCTION increment_views(row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET views = views + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create Increment Posts Count Function
CREATE OR REPLACE FUNCTION increment_posts_count(author_row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE authors
  SET posts_count = posts_count + 1
  WHERE id = author_row_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Create Decrement Posts Count Function
CREATE OR REPLACE FUNCTION decrement_posts_count(author_row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE authors
  SET posts_count = GREATEST(0, posts_count - 1)
  WHERE id = author_row_id;
END;
$$ LANGUAGE plpgsql;
