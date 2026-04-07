-- Social Posts System Migration
-- Creates posts table with proper relationships to businesses
-- Safe to run multiple times (idempotent)

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL, -- Match businesses.id type (TEXT)
    caption TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT posts_business_id_fkey FOREIGN KEY (business_id) 
        REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT posts_likes_count_check CHECK (likes_count >= 0),
    CONSTRAINT posts_comments_count_check CHECK (comments_count >= 0)
);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Posts are publicly readable'
    ) THEN
        CREATE POLICY "Posts are publicly readable" ON posts
            FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Service role can manage posts'
    ) THEN
        CREATE POLICY "Service role can manage posts" ON posts
            FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_business_id ON posts(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_posts_business_active ON posts(business_id, is_active) WHERE is_active = true;

-- Composite index for feed queries
CREATE INDEX IF NOT EXISTS idx_posts_feed_query ON posts(created_at DESC, is_active) WHERE is_active = true;

-- ============================================
-- HELPER FUNCTION: Validate business exists
-- ============================================
CREATE OR REPLACE FUNCTION business_exists(p_business_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM businesses 
        WHERE id = p_business_id AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Validate business_id on insert
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tr_posts_business_validation'
    ) THEN
        CREATE TRIGGER tr_posts_business_validation
            BEFORE INSERT OR UPDATE ON posts
            FOR EACH ROW
            EXECUTE FUNCTION business_exists_validation();
    END IF;
END
$$;

-- Validation function
CREATE OR REPLACE FUNCTION business_exists_validation()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT business_exists(NEW.business_id) THEN
        RAISE EXCEPTION 'Business with ID % does not exist or is not approved', NEW.business_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW FOR POSTS WITH BUSINESS INFO
-- ============================================
CREATE OR REPLACE VIEW posts_with_business AS
SELECT 
    p.id,
    p.business_id,
    p.caption,
    p.image_url,
    p.created_at,
    p.likes_count,
    p.comments_count,
    p.is_active,
    b.business_name,
    b.category,
    b.governorate,
    b.city,
    b.image_url as business_logo,
    b.phone_1,
    b.whatsapp
FROM posts p
INNER JOIN businesses b ON p.business_id = b.id
WHERE p.is_active = true AND b.status = 'approved';

-- ============================================
-- SAMPLE DATA INSERT (for development)
-- ============================================
-- This will only insert if posts table is empty
INSERT INTO posts (business_id, caption, image_url, likes_count, comments_count)
SELECT 
    b.id,
    CASE 
        WHEN b.category = 'Restaurant' THEN 'Fresh ingredients and authentic flavors! Come taste our special dishes today. #Food #Restaurant'
        WHEN b.category = 'Cafe' THEN 'Perfect coffee brewed with love. Your daily escape starts here. #Coffee #Cafe'
        WHEN b.category = 'Shopping' THEN 'New arrivals just in! Quality products at unbeatable prices. #Shopping #Deals'
        WHEN b.category = 'Hotel' THEN 'Comfortable rooms and exceptional service. Your home away from home. #Hotel #Hospitality'
        ELSE 'Quality service you can trust. Visit us today! #Business #Services'
    END,
    'https://picsum.photos/seed/' || b.id || '/400/400',
    floor(random() * 500) + 10, -- Random likes between 10-510
    floor(random() * 50) + 1    -- Random comments between 1-51
FROM businesses b
WHERE b.status = 'approved'
LIMIT 20
ON CONFLICT DO NOTHING; -- Prevent duplicates on re-run

-- Add comments documenting the new table
COMMENT ON TABLE posts IS 'Social media posts from businesses. Each post belongs to a business and can have likes/comments.';
COMMENT ON COLUMN posts.business_id IS 'References businesses.id (TEXT type). Business must exist and be approved.';
COMMENT ON COLUMN posts.caption IS 'Post text content. Can include hashtags and mentions.';
COMMENT ON COLUMN posts.image_url IS 'URL to post image. Should be a valid image URL.';
COMMENT ON COLUMN posts.likes_count IS 'Number of likes this post has received. Must be >= 0.';
COMMENT ON COLUMN posts.comments_count IS 'Number of comments this post has received. Must be >= 0.';
COMMENT ON COLUMN posts.is_active IS 'Whether this post is visible. Soft delete flag.';
COMMENT ON VIEW posts_with_business IS 'Convenient view for fetching posts with business information in one query.';
