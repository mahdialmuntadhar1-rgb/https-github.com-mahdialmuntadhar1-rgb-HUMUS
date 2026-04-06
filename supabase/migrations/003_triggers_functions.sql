-- BUSINESS SUBMISSION TRIGGERS AND FUNCTIONS
-- Auto-populate audit fields and validation

-- 1. Function to set audit fields on insert
CREATE OR REPLACE FUNCTION set_business_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Set submitted_by if not provided and user is authenticated
  IF NEW.submitted_by IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.submitted_by := auth.uid();
  END IF;
  
  -- Set default moderation status
  IF NEW.moderation_status IS NULL THEN
    NEW.moderation_status := 'pending';
  END IF;
  
  -- Set timestamps
  NEW.created_at := COALESCE(NEW.created_at, NOW());
  NEW.updated_at := COALESCE(NEW.updated_at, NOW());
  
  -- Set source if not provided
  IF NEW.source IS NULL THEN
    NEW.source := 'web_form';
  END IF;
  
  -- Normalize phone number (remove spaces, dashes, parentheses)
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := REGEXP_REPLACE(NEW.phone, '[^\d+]', '', 'g');
  END IF;
  
  -- Normalize whatsapp if provided
  IF NEW.whatsapp IS NOT NULL THEN
    NEW.whatsapp := REGEXP_REPLACE(NEW.whatsapp, '[^\d+]', '', 'g');
  END IF;
  
  -- Capitalize proper nouns
  IF NEW.name IS NOT NULL THEN
    NEW.name := INITCAP(TRIM(NEW.name));
  END IF;
  
  IF NEW.city IS NOT NULL THEN
    NEW.city := INITCAP(TRIM(NEW.city));
  END IF;
  
  -- Trim all text fields
  IF NEW.address IS NOT NULL THEN
    NEW.address := TRIM(NEW.address);
  END IF;
  
  IF NEW.description IS NOT NULL THEN
    NEW.description := TRIM(NEW.description);
  END IF;
  
  IF NEW.website IS NOT NULL THEN
    NEW.website := TRIM(NEW.website);
    -- Add protocol if missing
    IF NEW.website != '' AND NEW.website NOT LIKE 'http%' THEN
      NEW.website := 'https://' || NEW.website;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to update updated_at on modify
CREATE OR REPLACE FUNCTION update_business_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create triggers
DROP TRIGGER IF EXISTS businesses_audit_trigger ON businesses;
CREATE TRIGGER businesses_audit_trigger
  BEFORE INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_business_audit_fields();

DROP TRIGGER IF EXISTS businesses_update_trigger ON businesses;
CREATE TRIGGER businesses_update_trigger
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_business_timestamp();

-- 4. Function to get business with owner info
CREATE OR REPLACE FUNCTION get_business_with_owner(business_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  governorate TEXT,
  city TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  image_url TEXT,
  description TEXT,
  is_verified BOOLEAN,
  rating DECIMAL,
  review_count INTEGER,
  moderation_status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  submitted_by UUID,
  submitter_email TEXT,
  owner_id UUID,
  owner_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.category,
    b.governorate,
    b.city,
    b.phone,
    b.whatsapp,
    b.website,
    b.image_url,
    b.description,
    b.is_verified,
    b.rating,
    b.review_count,
    b.moderation_status,
    b.created_at,
    b.updated_at,
    b.submitted_by,
    u1.email as submitter_email,
    b.owner_id,
    u2.email as owner_email
  FROM businesses b
  LEFT JOIN auth.users u1 ON b.submitted_by = u1.id
  LEFT JOIN auth.users u2 ON b.owner_id = u2.id
  WHERE b.id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
