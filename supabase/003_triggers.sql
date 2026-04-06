-- TRIGGERS FOR BUSINESS SUBMISSION

-- 1. Function to set defaults on insert
CREATE OR REPLACE FUNCTION set_business_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Set submitted_by if user is authenticated and not provided
  IF NEW.submitted_by IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.submitted_by := auth.uid();
  END IF;
  
  -- Set status to pending for new submissions
  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;
  
  -- Set updated_at
  NEW.updated_at := NOW();
  
  -- Set verified to false for new submissions
  IF NEW.verified IS NULL THEN
    NEW.verified := FALSE;
  END IF;
  
  -- Normalize phone numbers
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := REGEXP_REPLACE(NEW.phone, '[^\d+]', '', 'g');
  END IF;
  
  IF NEW.whatsapp IS NOT NULL THEN
    NEW.whatsapp := REGEXP_REPLACE(NEW.whatsapp, '[^\d+]', '', 'g');
  END IF;
  
  -- Capitalize names
  IF NEW.name IS NOT NULL THEN
    NEW.name := INITCAP(TRIM(NEW.name));
  END IF;
  
  -- Trim text fields
  IF NEW.address IS NOT NULL THEN
    NEW.address := TRIM(NEW.address);
  END IF;
  
  IF NEW.description IS NOT NULL THEN
    NEW.description := TRIM(NEW.description);
  END IF;
  
  -- Fix website URL
  IF NEW.website IS NOT NULL AND NEW.website != '' THEN
    IF NEW.website NOT LIKE 'http%' THEN
      NEW.website := 'https://' || TRIM(NEW.website);
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
DROP TRIGGER IF EXISTS businesses_insert_trigger ON businesses;
CREATE TRIGGER businesses_insert_trigger
  BEFORE INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_business_defaults();

DROP TRIGGER IF EXISTS businesses_update_trigger ON businesses;
CREATE TRIGGER businesses_update_trigger
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_business_timestamp();
