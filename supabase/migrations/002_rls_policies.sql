-- RLS POLICIES FOR BUSINESSES TABLE
-- Public read, authenticated write with ownership

-- 1. Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "businesses_public_select" ON businesses;
DROP POLICY IF EXISTS "businesses_authenticated_insert" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_update" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_delete" ON businesses;

-- 3. Public read policy (approved businesses only)
CREATE POLICY "businesses_public_select" ON businesses
  FOR SELECT USING (
    moderation_status = 'approved' OR 
    auth.uid() IS NOT NULL
  );

-- 4. Authenticated insert policy (anyone can submit, goes to pending)
CREATE POLICY "businesses_authenticated_insert" ON businesses
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    name IS NOT NULL AND TRIM(name) != '' AND
    phone IS NOT NULL AND TRIM(phone) != '' AND
    category IS NOT NULL AND TRIM(category) != '' AND
    governorate IS NOT NULL AND TRIM(governorate) != '' AND
    city IS NOT NULL AND TRIM(city) != '' AND
    moderation_status = 'pending' AND
    submitted_by = auth.uid()
  );

-- 5. Owner update policy (can update own submissions)
CREATE POLICY "businesses_owner_update" ON businesses
  FOR UPDATE USING (
    submitted_by = auth.uid()
  );

-- 6. Owner delete policy (can delete own submissions if pending)
CREATE POLICY "businesses_owner_delete" ON businesses
  FOR DELETE USING (
    submitted_by = auth.uid() AND moderation_status = 'pending'
  );

-- 7. Admin override policy (for moderation)
-- Note: Create a separate admin_users table or use auth.users metadata for admin role
CREATE POLICY "businesses_admin_all" ON businesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
