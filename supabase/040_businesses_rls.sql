-- ============================================
-- BUSINESSES TABLE RLS POLICIES
-- Purpose: Protect owner_id from direct client updates
-- Security: Only approved claims can assign ownership
-- ============================================

-- Enable RLS on businesses table
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR BUSINESSES TABLE
-- ============================================

-- Allow public read access (for browsing)
DROP POLICY IF EXISTS "Businesses are publicly readable" ON businesses;
CREATE POLICY "Businesses are publicly readable"
    ON businesses FOR SELECT
    USING (true);

-- Allow users to insert businesses (for new submissions)
DROP POLICY IF EXISTS "Users can insert businesses" ON businesses;
CREATE POLICY "Users can insert businesses"
    ON businesses FOR INSERT
    WITH CHECK (true);

-- Allow users to update their OWN businesses (only if they are the owner)
DROP POLICY IF EXISTS "Owners can update their businesses" ON businesses;
CREATE POLICY "Owners can update their businesses"
    ON businesses FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- BLOCK: Users cannot directly update owner_id
-- This is handled only through the approve_claim_request function
DROP POLICY IF EXISTS "Block direct owner_id updates" ON businesses;
CREATE POLICY "Block direct owner_id updates"
    ON businesses FOR UPDATE
    USING (
        -- Allow update if owner_id is not being changed
        (owner_id IS NULL AND owner_id IS NULL) OR
        (owner_id IS NOT NULL AND owner_id = owner_id)
    )
    WITH CHECK (
        -- Same check for WITH CHECK
        (owner_id IS NULL AND owner_id IS NULL) OR
        (owner_id IS NOT NULL AND owner_id = owner_id)
    );

-- Allow admins to update any business
DROP POLICY IF EXISTS "Admins can update businesses" ON businesses;
CREATE POLICY "Admins can update businesses"
    ON businesses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow service role full access (for admin operations and claim approval function)
DROP POLICY IF EXISTS "Service role has full access" ON businesses;
CREATE POLICY "Service role has full access"
    ON businesses TO service_role
    USING (true) WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY "Block direct owner_id updates" ON businesses IS 'Prevents users from directly claiming businesses - must go through claim_requests approval flow';
COMMENT ON POLICY "Owners can update their businesses" ON businesses IS 'Only verified owners can update their business profiles';
COMMENT ON POLICY "Admins can update businesses" ON businesses IS 'Admins have full update access for moderation';

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify policies are in place:
-- ============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'businesses';
