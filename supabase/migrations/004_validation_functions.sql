-- BUSINESS SUBMISSION VALIDATION FUNCTION
-- Server-side validation for business submissions

CREATE OR REPLACE FUNCTION validate_business_submission(
  business_name TEXT,
  business_phone TEXT,
  business_category TEXT,
  business_governorate TEXT,
  business_city TEXT
)
RETURNS TABLE(
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  -- Validate required fields
  IF business_name IS NULL OR TRIM(business_name) = '' THEN
    RETURN QUERY SELECT FALSE, 'Business name is required';
    RETURN;
  END IF;
  
  IF business_phone IS NULL OR TRIM(business_phone) = '' THEN
    RETURN QUERY SELECT FALSE, 'Phone number is required';
    RETURN;
  END IF;
  
  IF business_category IS NULL OR TRIM(business_category) = '' THEN
    RETURN QUERY SELECT FALSE, 'Category is required';
    RETURN;
  END IF;
  
  IF business_governorate IS NULL OR TRIM(business_governorate) = '' THEN
    RETURN QUERY SELECT FALSE, 'Governorate is required';
    RETURN;
  END IF;
  
  IF business_city IS NULL OR TRIM(business_city) = '' THEN
    RETURN QUERY SELECT FALSE, 'City is required';
    RETURN;
  END IF;
  
  -- Validate phone format (basic)
  IF NOT business_phone ~ '^[\+]?[0-9\s\-\(\)]+$' THEN
    RETURN QUERY SELECT FALSE, 'Invalid phone number format';
    RETURN;
  END IF;
  
  -- Validate category
  IF NOT EXISTS (
    SELECT 1 FROM (VALUES 
      ('Restaurant'), ('Cafe'), ('Hotel'), ('Hospital'), ('Clinic'), ('Pharmacy'),
      ('Supermarket'), ('Shopping'), ('Gym'), ('Salon'), ('Car Repair'), ('Electronics'),
      ('Education'), ('Real Estate'), ('Travel'), ('Bank'), ('Other')
    ) AS cats(cat) WHERE cat = business_category
  ) THEN
    RETURN QUERY SELECT FALSE, 'Invalid category';
    RETURN;
  END IF;
  
  -- Validate governorate
  IF NOT EXISTS (
    SELECT 1 FROM (VALUES 
      ('Baghdad'), ('Basra'), ('Mosul'), ('Erbil'), ('Sulaymaniyah'), ('Duhok'),
      ('Kirkuk'), ('Najaf'), ('Karbala'), ('Hilla'), ('Diyala'), ('Anbar'),
      ('Salahuddin'), ('Dhi Qar'), ('Muthanna'), ('Wasit'), ('Babil'), ('Qadisiyah')
    ) AS gov(gov) WHERE gov = business_governorate
  ) THEN
    RETURN QUERY SELECT FALSE, 'Invalid governorate';
    RETURN;
  END IF;
  
  -- All validations passed
  RETURN QUERY SELECT TRUE, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- BUSINESS CLAIM FUNCTION
-- For future business claiming functionality

CREATE OR REPLACE FUNCTION claim_business(
  business_id UUID,
  claimant_user_id UUID,
  claim_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  business_owner_id UUID;
BEGIN
  -- Get current owner
  SELECT owner_id INTO business_owner_id 
  FROM businesses 
  WHERE id = business_id;
  
  -- Check if business exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Business not found';
    RETURN;
  END IF;
  
  -- Check if already claimed
  IF business_owner_id IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'Business already has an owner';
    RETURN;
  END IF;
  
  -- Update business with owner
  UPDATE businesses 
  SET 
    owner_id = claimant_user_id,
    is_verified = TRUE,
    last_verified_at = NOW(),
    updated_at = NOW()
  WHERE id = business_id;
  
  -- Create claim record (optional - create claims table if needed)
  -- INSERT INTO business_claims (business_id, user_id, claim_notes, status) 
  -- VALUES (business_id, claimant_user_id, claim_notes, 'approved');
  
  RETURN QUERY SELECT TRUE, 'Business claimed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- MODERATION FUNCTIONS
-- For admin moderation workflow

CREATE OR REPLACE FUNCTION approve_business(business_id UUID, moderator_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE businesses 
  SET 
    moderation_status = 'approved',
    updated_at = NOW()
  WHERE id = business_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_business(business_id UUID, moderator_user_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE businesses 
  SET 
    moderation_status = 'rejected',
    updated_at = NOW()
  WHERE id = business_id;
  
  -- Log rejection (optional - create moderation_log table)
  -- INSERT INTO moderation_log (business_id, moderator_id, action, reason)
  -- VALUES (business_id, moderator_user_id, 'rejected', reason);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
