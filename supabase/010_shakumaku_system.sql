-- Shakumaku Social Feed System
-- Creates tables for business postcards/social posts with admin management

-- ============================================
-- SHAKUMAKU POSTS TABLE (Business Postcards)
-- ============================================
CREATE TABLE IF NOT EXISTS shakumaku_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    caption TEXT NOT NULL,
    caption_ar TEXT, -- Arabic caption (main display)
    caption_en TEXT, -- English translation
    image_url TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- For admin management
    admin_notes TEXT,
    sponsored_by TEXT, -- For future sponsorship feature
    display_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE shakumaku_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Shakumaku posts are publicly readable" ON shakumaku_posts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage posts" ON shakumaku_posts
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shakumaku_business_id ON shakumaku_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_shakumaku_active ON shakumaku_posts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shakumaku_featured ON shakumaku_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_shakumaku_created_at ON shakumaku_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shakumaku_display_order ON shakumaku_posts(display_order);

-- ============================================
-- VIEW: Shakumaku with Business Info
-- ============================================
CREATE OR REPLACE VIEW shakumaku_with_business AS
SELECT 
    sp.*,
    b.name as business_name,
    b."nameAr" as business_name_ar,
    b."nameKu" as business_name_ku,
    b.category,
    b.subcategory,
    b.governorate,
    b.city,
    b.phone,
    b."imageUrl" as business_image,
    b."coverImage" as business_cover,
    b."isPremium",
    b."isFeatured" as business_featured
FROM shakumaku_posts sp
LEFT JOIN businesses b ON sp.business_id = b.id
WHERE sp.is_active = true;

-- ============================================
-- FUNCTION: Increment likes safely
-- ============================================
CREATE OR REPLACE FUNCTION increment_shakumaku_likes(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE shakumaku_posts 
    SET likes_count = likes_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shakumaku_updated_at
    BEFORE UPDATE ON shakumaku_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE ARABIC CAPTION TEMPLATES
-- ============================================
-- These can be used by the generator script
COMMENT ON TABLE shakumaku_posts IS 'Shakumaku social feed posts - business postcards for discovery';
COMMENT ON COLUMN shakumaku_posts.caption_ar IS 'Primary Arabic caption displayed to users';
COMMENT ON COLUMN shakumaku_posts.sponsored_by IS 'For future promoted posts feature - sponsor name or null';
