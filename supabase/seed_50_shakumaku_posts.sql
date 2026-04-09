-- ============================================
-- SEED 50 SHAKUMAKU POSTS (SQL-Only Solution)
-- Run this in Supabase SQL Editor after the shakumaku_posts table exists
-- ============================================

-- First, let's see the table structure (headers/columns):
COMMENT ON TABLE shakumaku_posts IS 'Table structure:
- id: UUID (auto-generated)
- business_id: TEXT (links to businesses.id)
- caption: TEXT (main display caption)
- caption_ar: TEXT (Arabic caption)
- caption_en: TEXT (English translation)
- image_url: TEXT (postcard image URL)
- likes_count: INTEGER (default 0)
- views_count: INTEGER (default 0)
- is_active: BOOLEAN (default true)
- is_featured: BOOLEAN (default false)
- created_at: TIMESTAMPTZ (auto)
- updated_at: TIMESTAMPTZ (auto)
- created_by: UUID (optional)
- admin_notes: TEXT (optional)
- sponsored_by: TEXT (optional)
- display_order: INTEGER (default 0)
';

-- ============================================
-- INSERT 50 SHAKUMAKU POSTS FROM REAL BUSINESSES
-- ============================================

WITH selected_businesses AS (
  SELECT 
    id,
    name,
    "nameAr",
    category,
    governorate,
    city,
    "imageUrl",
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY "isFeatured" DESC, created_at DESC) as cat_rank
  FROM businesses
  WHERE status = 'approved'
    AND name IS NOT NULL
  ORDER BY "isFeatured" DESC, created_at DESC
  LIMIT 50
),
captions AS (
  SELECT * FROM (VALUES
    ('✨ تجربة فريدة في {name} بـ{city}! وجهة مميزة بانتظاركم 🌟'),
    ('📍 {name} في {city} - حيث الجودة تلتقي بالتميز! ✨'),
    ('🔥 اكتشفوا {name} في {city}! أفضل خدمات {category} في المنطقة'),
    ('✨ {name} - عنوان التميز في {city} 🌟'),
    ('🌟 مكانكم المفضل في {city}: {name}! تفضلوا بزيارتنا ✨'),
    ('📍 {name} في {city} - رحبوا بالتميز والجودة العالية ✨'),
    ('✨ وجهة رائعة في {city}: {name}! تجربة لا تُنسى 🌟'),
    ('🔥 {name} بـ{city} - حيث يلتقي الإبداع بالجودة! ✨'),
    ('🌟 {name} في {city} - خدمة ممتازة بانتظاركم ✨'),
    ('📍 اكتشفوا سر تميز {name} في {city} اليوم! 🌟')
  ) AS t(template)
),
images AS (
  SELECT * FROM (VALUES
    ('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'),
    ('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80'),
    ('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'),
    ('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'),
    ('https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80'),
    ('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'),
    ('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'),
    ('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80')
  ) AS t(url)
)
INSERT INTO shakumaku_posts (
  business_id,
  caption,
  caption_ar,
  caption_en,
  image_url,
  likes_count,
  views_count,
  is_active,
  is_featured,
  display_order,
  admin_notes
)
SELECT 
  sb.id as business_id,
  REPLACE(REPLACE(REPLACE(
    (SELECT template FROM captions ORDER BY random() LIMIT 1),
    '{name}', 
    COALESCE(sb."nameAr", sb.name, 'هذا المكان')
  ), '{city}', COALESCE(sb.city, sb.governorate, 'العراق')), '{category}', COALESCE(sb.category, 'الخدمات')) as caption,
  REPLACE(REPLACE(REPLACE(
    (SELECT template FROM captions ORDER BY random() LIMIT 1),
    '{name}', 
    COALESCE(sb."nameAr", sb.name, 'هذا المكان')
  ), '{city}', COALESCE(sb.city, sb.governorate, 'العراق')), '{category}', COALESCE(sb.category, 'الخدمات')) as caption_ar,
  'Discover ' || sb.name || ' in ' || COALESCE(sb.city, sb.governorate, 'Iraq') || '!' as caption_en,
  COALESCE(sb."imageUrl", (SELECT url FROM images ORDER BY random() LIMIT 1)) as image_url,
  floor(random() * 200 + 50)::int as likes_count,
  floor(random() * 1000 + 100)::int as views_count,
  true as is_active,
  (ROW_NUMBER() OVER () <= 10) as is_featured,
  (ROW_NUMBER() OVER () - 1) as display_order,
  'Auto-generated from ' || sb.name || ' (' || sb.category || ')' as admin_notes
FROM selected_businesses sb
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY INSERTION
-- ============================================
SELECT 
  'Total posts created:' as status,
  COUNT(*) as count
FROM shakumaku_posts;
