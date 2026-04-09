-- Verify where posts are
SELECT 
  'shakumaku_posts' as table_name,
  COUNT(*) as count
FROM shakumaku_posts
UNION ALL
SELECT 
  'posts' as table_name,
  COUNT(*) as count  
FROM posts
UNION ALL
SELECT 
  'business_postcards' as table_name,
  COUNT(*) as count
FROM business_postcards;

-- Show sample shakumaku posts
SELECT 
  id,
  business_id,
  SUBSTRING(caption_ar, 1, 50) as caption_preview,
  is_active,
  is_featured
FROM shakumaku_posts
LIMIT 5;
