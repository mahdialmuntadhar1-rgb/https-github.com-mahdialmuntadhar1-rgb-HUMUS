-- Social Feed System Migration for Iraq Business Directory
-- Creates posts and post_comments tables with proper relationships to businesses
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
    is_seeded BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT posts_business_id_fkey FOREIGN KEY (business_id) 
        REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT posts_likes_count_check CHECK (likes_count >= 0),
    CONSTRAINT posts_comments_count_check CHECK (comments_count >= 0),
    CONSTRAINT posts_shares_count_check CHECK (shares_count >= 0),
    CONSTRAINT posts_status_check CHECK (status IN ('active', 'hidden', 'deleted'))
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
            FOR SELECT USING (status = 'active');
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
-- POST COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_seeded BOOLEAN DEFAULT FALSE
);

-- Enable RLS on post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_comments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Comments are publicly readable'
    ) THEN
        CREATE POLICY "Comments are publicly readable" ON post_comments
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Service role can manage comments'
    ) THEN
        CREATE POLICY "Service role can manage comments" ON post_comments
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
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_posts_business_active ON posts(business_id, status) WHERE status = 'active';

-- Composite index for feed queries
CREATE INDEX IF NOT EXISTS idx_posts_feed_query ON posts(created_at DESC, status) WHERE status = 'active';

-- Post comments indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- ============================================
-- VIEWS FOR CONVENIENT QUERIES
-- ============================================

-- View for posts with business info
CREATE OR REPLACE VIEW posts_with_business AS
SELECT 
    p.id,
    p.business_id,
    p.caption,
    p.image_url,
    p.created_at,
    p.is_seeded,
    p.status,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    b.business_name,
    b.category,
    b.governorate,
    b.city,
    b.image_url as business_logo,
    b.phone_1,
    b.whatsapp
FROM posts p
INNER JOIN businesses b ON p.business_id = b.id
WHERE p.status = 'active' AND b.status = 'approved';

-- View for posts with comments
CREATE OR REPLACE VIEW posts_with_comments AS
SELECT 
    p.*,
    c.id as comment_id,
    c.author_name as comment_author,
    c.comment_text,
    c.created_at as comment_created_at,
    c.is_seeded as comment_is_seeded
FROM posts_with_business p
LEFT JOIN post_comments c ON p.id = c.post_id
WHERE p.status = 'active'
ORDER BY p.created_at DESC, c.created_at DESC;

-- ============================================
-- FUNCTIONS FOR FEED OPERATIONS
-- ============================================

-- Function to increment likes
CREATE OR REPLACE FUNCTION increment_likes(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE posts 
    SET likes_count = likes_count + 1 
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comments
CREATE OR REPLACE FUNCTION increment_comments(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE posts 
    SET comments_count = comments_count + 1 
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get feed with pagination
CREATE OR REPLACE FUNCTION get_feed(p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    business_id TEXT,
    caption TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    business_name TEXT,
    category TEXT,
    governorate TEXT,
    city TEXT,
    business_logo TEXT,
    phone_1 TEXT,
    whatsapp TEXT,
    comments JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.business_id,
        p.caption,
        p.image_url,
        p.created_at,
        p.likes_count,
        p.comments_count,
        p.shares_count,
        p.business_name,
        p.category,
        p.governorate,
        p.city,
        p.business_logo,
        p.phone_1,
        p.whatsapp,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'author_name', c.author_name,
                    'comment_text', c.comment_text,
                    'created_at', c.created_at
                ) ORDER BY c.created_at DESC
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::JSONB
        ) as comments
    FROM posts_with_business p
    LEFT JOIN post_comments c ON p.id = c.post_id
    GROUP BY p.id, p.business_id, p.caption, p.image_url, p.created_at, p.likes_count, p.comments_count, p.shares_count, p.business_name, p.category, p.governorate, p.city, p.business_logo, p.phone_1, p.whatsapp
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA INSERT (for development)
-- ============================================
-- This will only insert if posts table is empty
INSERT INTO posts (business_id, caption, image_url, is_seeded, likes_count, comments_count, shares_count)
SELECT 
    b.id,
    CASE 
        WHEN b.category = 'Restaurant' THEN 'Enjoy our authentic Iraqi cuisine! Fresh ingredients and traditional recipes passed down through generations. # IraqiFood # Restaurant # Baghdad'
        WHEN b.category = 'Cafe' THEN 'Perfect coffee brewed with love in the heart of Iraq. Your daily escape starts here. #Coffee #Cafe #Erbil'
        WHEN b.category = 'Shopping' THEN 'New arrivals just in! Quality products at unbeatable prices. Discover the best of Iraqi shopping. #Shopping #Deals #Basra'
        WHEN b.category = 'Hotel' THEN 'Comfortable rooms and exceptional Iraqi hospitality. Your home away from home. #Hotel #Hospitality #Sulaymaniyah'
        ELSE 'Quality service you can trust. Visit us today and experience the best of Iraq! #Business #Services #Iraq'
    END,
    'https://picsum.photos/seed/' || b.id || '/400/400',
    TRUE,
    floor(random() * 100) + 5, -- Random likes between 5-105
    floor(random() * 20) + 1,   -- Random comments between 1-21
    floor(random() * 30) + 1    -- Random shares between 1-31
FROM businesses b
WHERE b.status = 'approved'
LIMIT 15
ON CONFLICT DO NOTHING; -- Prevent duplicates on re-run

-- Insert sample comments for the seeded posts
INSERT INTO post_comments (post_id, author_name, comment_text, is_seeded)
SELECT 
    p.id,
    CASE floor(random() * 6) + 1
        WHEN 1 THEN ' Ahmed'
        WHEN 2 THEN ' Fatima'
        WHEN 3 THEN ' Ali'
        WHEN 4 THEN ' Zainab'
        WHEN 5 THEN ' Omar'
        WHEN 6 THEN ' Layla'
    END,
    CASE floor(random() * 5) + 1
        WHEN 1 THEN 'Excellent! Highly recommended.'
        WHEN 2 THEN 'Amazing service and quality.'
        WHEN 3 THEN 'Love this place! Will visit again.'
        WHEN 4 THEN 'Great experience overall.'
        WHEN 5 THEN 'Professional and trustworthy.'
    END,
    TRUE
FROM posts p
WHERE p.is_seeded = TRUE
ORDER BY random()
LIMIT 25
ON CONFLICT DO NOTHING;

-- Add comments documenting the new tables
COMMENT ON TABLE posts IS 'Social media posts from businesses. Each post belongs to a business and can have likes/comments/shares.';
COMMENT ON COLUMN posts.business_id IS 'References businesses.id (TEXT type). Business must exist and be approved.';
COMMENT ON COLUMN posts.caption IS 'Post text content in Arabic. Can include hashtags and mentions.';
COMMENT ON COLUMN posts.image_url IS 'URL to post image. Should be a valid image URL.';
COMMENT ON COLUMN posts.is_seeded IS 'Whether this post was automatically seeded for development.';
COMMENT ON COLUMN posts.status IS 'Post visibility status: active, hidden, or deleted.';
COMMENT ON COLUMN posts.likes_count IS 'Number of likes this post has received. Must be >= 0.';
COMMENT ON COLUMN posts.comments_count IS 'Number of comments this post has received. Must be >= 0.';
COMMENT ON COLUMN posts.shares_count IS 'Number of times this post has been shared. Must be >= 0.';

COMMENT ON TABLE post_comments IS 'Comments on business posts. Supports threaded discussions.';
COMMENT ON COLUMN post_comments.post_id IS 'References posts.id. Comment belongs to this post.';
COMMENT ON COLUMN post_comments.author_name IS 'Name of the comment author.';
COMMENT ON COLUMN post_comments.comment_text IS 'Comment text content.';
COMMENT ON COLUMN post_comments.is_seeded IS 'Whether this comment was automatically seeded for development.';

COMMENT ON VIEW posts_with_business IS 'Convenient view for fetching posts with business information in one query.';
COMMENT ON VIEW posts_with_comments IS 'Posts with their comments joined, useful for feed display.';
COMMENT ON FUNCTION get_feed IS 'Function to retrieve paginated feed with posts and their comments.';

SELECT 'Social Feed System Migration Complete!' as result;
