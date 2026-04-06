-- FIX 401 UNAUTHORIZED ERRORS
-- Public SELECT policies for businesses and posts

-- Enable RLS if not already enabled
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "businesses_public_select" ON businesses;
DROP POLICY IF EXISTS "businesses_authenticated_insert" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_update" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_delete" ON businesses;

DROP POLICY IF EXISTS "posts_public_select" ON posts;
DROP POLICY IF EXISTS "posts_authenticated_insert" ON posts;
DROP POLICY IF EXISTS "posts_owner_update" ON posts;

-- 1. PUBLIC SELECT for businesses (no auth required)
CREATE POLICY "businesses_public_select" ON businesses
  FOR SELECT USING (true);

-- 2. PUBLIC SELECT for posts (no auth required)
CREATE POLICY "posts_public_select" ON posts
  FOR SELECT USING (true);

-- 3. Authenticated INSERT for businesses (requires login)
CREATE POLICY "businesses_authenticated_insert" ON businesses
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    name IS NOT NULL AND TRIM(name) != '' AND
    phone IS NOT NULL AND TRIM(phone) != '' AND
    category IS NOT NULL AND TRIM(category) != '' AND
    governorate IS NOT NULL AND TRIM(governorate) != '' AND
    city IS NOT NULL AND TRIM(city) != ''
  );

-- 4. Authenticated INSERT for posts (requires login)
CREATE POLICY "posts_authenticated_insert" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    business_id IS NOT NULL AND
    content IS NOT NULL AND TRIM(content) != ''
  );

-- 5. Owner UPDATE for businesses
CREATE POLICY "businesses_owner_update" ON businesses
  FOR UPDATE USING (
    submitted_by = auth.uid()
  );

-- 6. Owner UPDATE for posts  
CREATE POLICY "posts_owner_update" ON posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = posts.business_id 
      AND businesses.submitted_by = auth.uid()
    )
  );

-- 7. Owner DELETE for businesses
CREATE POLICY "businesses_owner_delete" ON businesses
  FOR DELETE USING (
    submitted_by = auth.uid()
  );

-- 8. Owner DELETE for posts
CREATE POLICY "posts_owner_delete" ON posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = posts.business_id 
      AND businesses.submitted_by = auth.uid()
    )
  );
