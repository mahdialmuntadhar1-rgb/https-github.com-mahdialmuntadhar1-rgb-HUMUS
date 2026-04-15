-- ============================================
-- ADD is_demo COLUMN TO POSTS TABLE
-- Purpose: Mark demo posts for easy identification and deletion
-- ============================================

-- Add is_demo column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add index for faster demo post queries
CREATE INDEX IF NOT EXISTS idx_posts_is_demo ON posts(is_demo);

-- Add comment
COMMENT ON COLUMN posts.is_demo IS 'Flag to identify demo/test posts for easy deletion';
