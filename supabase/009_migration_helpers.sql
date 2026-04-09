-- Shaku Maku Posts Table Schema
-- Migration helper scripts for data engineering tasks

-- Create posts table if not exists
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id BIGINT REFERENCES businesses(id),
  
  display_name TEXT NOT NULL,
  caption_ar TEXT NOT NULL,
  caption_en TEXT,
  
  image_url TEXT NOT NULL,
  image_prompt TEXT,
  
  category TEXT,
  governorate TEXT,
  raw_phone TEXT,
  normalized_phone TEXT,
  whatsapp_phone TEXT,
  
  post_style TEXT DEFAULT 'postcard' CHECK (post_style IN ('postcard', 'spotlight', 'story')),
  featured BOOLEAN DEFAULT false,
  
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_governorate ON posts(governorate);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured) WHERE featured = true;

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to published posts"
  ON posts FOR SELECT TO anon
  USING (published_at IS NOT NULL AND published_at <= NOW());

CREATE POLICY IF NOT EXISTS "Allow service role full access"
  ON posts TO service_role USING (true) WITH CHECK (true);

-- View for post analytics
CREATE OR REPLACE VIEW post_analytics AS
SELECT 
  p.id,
  p.display_name,
  p.category,
  p.governorate,
  p.featured,
  p.likes_count,
  p.views_count,
  p.created_at,
  CASE 
    WHEN p.views_count > 0 THEN ROUND((p.likes_count::numeric / p.views_count) * 100, 2)
    ELSE 0
  END as engagement_rate
FROM posts p;

COMMENT ON TABLE posts IS 'Shaku Maku social feed posts featuring Iraqi businesses';
