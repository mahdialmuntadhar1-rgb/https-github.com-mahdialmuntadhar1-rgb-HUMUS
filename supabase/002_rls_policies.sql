-- RLS POLICIES

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "businesses_select_policy" ON businesses;
DROP POLICY IF EXISTS "businesses_insert_policy" ON businesses;
DROP POLICY IF EXISTS "businesses_update_policy" ON businesses;
DROP POLICY IF EXISTS "businesses_delete_policy" ON businesses;

-- 1. Public read access
CREATE POLICY "businesses_public_select" ON businesses
  FOR SELECT USING (true);

-- 2. Authenticated users can insert
CREATE POLICY "businesses_authenticated_insert" ON businesses
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    name IS NOT NULL AND TRIM(name) != '' AND
    phone IS NOT NULL AND TRIM(phone) != '' AND
    category IS NOT NULL AND TRIM(category) != '' AND
    governorate IS NOT NULL AND TRIM(governorate) != '' AND
    city IS NOT NULL AND TRIM(city) != ''
  );

-- 3. Users can update their own submissions
CREATE POLICY "businesses_owner_update" ON businesses
  FOR UPDATE USING (
    submitted_by = auth.uid()
  );

-- 4. Users can delete their own submissions
CREATE POLICY "businesses_owner_delete" ON businesses
  FOR DELETE USING (
    submitted_by = auth.uid()
  );

-- 5. Prevent anonymous destructive operations
-- (No policy needed - RLS blocks by default)
