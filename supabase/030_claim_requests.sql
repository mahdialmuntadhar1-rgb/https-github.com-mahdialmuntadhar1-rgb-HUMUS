-- ============================================
-- CLAIM REQUESTS TABLE FOR SAFE BUSINESS CLAIMING
-- Purpose: Store pending business ownership claims requiring admin approval
-- Security: Prevents direct owner_id assignment without verification
-- ============================================

-- ============================================
-- CLAIM REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS claim_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_claim_requests_business_id ON claim_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_user_id ON claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_claim_requests_submitted_at ON claim_requests(submitted_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Allow users to read their own claim requests
DROP POLICY IF EXISTS "Users can view own claim requests" ON claim_requests;
CREATE POLICY "Users can view own claim requests" 
    ON claim_requests FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to insert their own claim requests
DROP POLICY IF EXISTS "Users can insert own claim requests" ON claim_requests;
CREATE POLICY "Users can insert own claim requests" 
    ON claim_requests FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own claim requests (limited fields only)
DROP POLICY IF EXISTS "Users can update own claim requests" ON claim_requests;
CREATE POLICY "Users can update own claim requests" 
    ON claim_requests FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Allow admins to read all claim requests
DROP POLICY IF EXISTS "Admins can view all claim requests" ON claim_requests;
CREATE POLICY "Admins can view all claim requests" 
    ON claim_requests FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update claim requests (for approval/rejection)
DROP POLICY IF EXISTS "Admins can update claim requests" ON claim_requests;
CREATE POLICY "Admins can update claim requests" 
    ON claim_requests FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow service role full access
DROP POLICY IF EXISTS "Service role has full access" ON claim_requests;
CREATE POLICY "Service role has full access" 
    ON claim_requests TO service_role 
    USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_claim_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_claim_requests_updated_at ON claim_requests;

CREATE TRIGGER update_claim_requests_updated_at
    BEFORE UPDATE ON claim_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_claim_requests_updated_at();

-- ============================================
-- FUNCTION: Approve claim request and assign business ownership
-- ============================================
CREATE OR REPLACE FUNCTION approve_claim_request(claim_request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_business_id TEXT;
    v_user_id UUID;
BEGIN
    -- Get claim request details
    SELECT business_id, user_id INTO v_business_id, v_user_id
    FROM claim_requests
    WHERE id = claim_request_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Claim request not found or not pending';
    END IF;

    -- Update business owner_id
    UPDATE businesses
    SET owner_id = v_user_id,
        updated_at = NOW()
    WHERE id = v_business_id AND owner_id IS NULL;

    -- Update claim request status
    UPDATE claim_requests
    SET status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = auth.uid()
    WHERE id = claim_request_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE claim_requests IS 'Pending business ownership claims requiring admin approval before owner_id assignment';
COMMENT ON COLUMN claim_requests.status IS 'pending, approved, or rejected';
COMMENT ON COLUMN claim_requests.reviewed_by IS 'Admin user who approved/rejected the claim';
COMMENT ON FUNCTION approve_claim_request IS 'Safely approves a claim and assigns business ownership atomically';
