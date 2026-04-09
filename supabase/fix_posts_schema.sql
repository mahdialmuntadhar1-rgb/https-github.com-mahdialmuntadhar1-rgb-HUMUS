-- Fix posts table schema for belive
-- Check current columns first, then add missing ones

-- Add is_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_active BOOLEAN DEFAULT true;
        UPDATE posts SET is_active = true;
    END IF;
END $$;

-- Add likes_count if missing (check if likes exists first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'likes_count'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'likes'
    ) THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
        UPDATE posts SET likes_count = COALESCE(likes, 0);
    END IF;
END $$;

-- Add comments_count if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Rename columns if using camelCase (businessId -> business_id, etc.)
-- Only run if needed based on your actual schema
/*
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'businessId'
    ) THEN
        ALTER TABLE posts RENAME COLUMN "businessId" TO business_id;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'imageUrl'
    ) THEN
        ALTER TABLE posts RENAME COLUMN "imageUrl" TO image_url;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE posts RENAME COLUMN "createdAt" TO created_at;
    END IF;
END $$;
*/

-- View current schema
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;
