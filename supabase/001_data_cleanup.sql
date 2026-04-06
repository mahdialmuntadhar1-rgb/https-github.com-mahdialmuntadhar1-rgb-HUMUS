-- DATA CLEANUP & SCHEMA HARDENING

-- 1. Clean existing data
UPDATE businesses 
SET 
  category = CASE 
    WHEN category IS NULL OR category IN ('unknown', 'null', '', '-', 'n/a', 'N/A') THEN 'Other'
    WHEN category ILIKE '%restaurant%' THEN 'Restaurant'
    WHEN category ILIKE '%cafe%' OR category ILIKE '%coffee%' THEN 'Cafe'
    WHEN category ILIKE '%hotel%' THEN 'Hotel'
    WHEN category ILIKE '%hospital%' OR category ILIKE '%medical%' THEN 'Hospital'
    WHEN category ILIKE '%clinic%' THEN 'Clinic'
    WHEN category ILIKE '%pharmacy%' THEN 'Pharmacy'
    WHEN category ILIKE '%supermarket%' OR category ILIKE '%grocery%' THEN 'Supermarket'
    WHEN category ILIKE '%shopping%' OR category ILIKE '%store%' THEN 'Shopping'
    WHEN category ILIKE '%gym%' OR category ILIKE '%fitness%' THEN 'Gym'
    WHEN category ILIKE '%salon%' OR category ILIKE '%beauty%' THEN 'Salon'
    WHEN category ILIKE '%car%' OR category ILIKE '%auto%' THEN 'Car Repair'
    WHEN category ILIKE '%electronics%' THEN 'Electronics'
    WHEN category ILIKE '%education%' OR category ILIKE '%school%' THEN 'Education'
    WHEN category ILIKE '%real estate%' OR category ILIKE '%property%' THEN 'Real Estate'
    WHEN category ILIKE '%travel%' OR category ILIKE '%tourism%' THEN 'Travel'
    WHEN category ILIKE '%bank%' OR category ILIKE '%financial%' THEN 'Bank'
    ELSE category
  END,
  governorate = CASE 
    WHEN governorate IS NULL OR governorate IN ('unknown', 'null', '', '-', 'n/a', 'N/A') THEN 'Baghdad'
    ELSE INITCAP(TRIM(governorate))
  END,
  city = CASE 
    WHEN city IS NULL OR city = '' THEN 'Unknown'
    ELSE INITCAP(TRIM(city))
  END,
  phone = CASE 
    WHEN phone IS NOT NULL THEN REGEXP_REPLACE(phone, '[^\d+]', '', 'g')
    ELSE phone
  END,
  whatsapp = CASE 
    WHEN whatsapp IS NOT NULL THEN REGEXP_REPLACE(whatsapp, '[^\d+]', '', 'g')
    ELSE whatsapp
  END,
  name = CASE 
    WHEN name IS NOT NULL THEN INITCAP(TRIM(name))
    ELSE name
  END,
  address = CASE 
    WHEN address IS NOT NULL THEN TRIM(address)
    ELSE address
  END,
  description = CASE 
    WHEN description IS NOT NULL THEN TRIM(description)
    ELSE description
  END,
  website = CASE 
    WHEN website IS NOT NULL AND website != '' THEN 
      CASE 
        WHEN website NOT LIKE 'http%' THEN 'https://' || TRIM(website)
        ELSE TRIM(website)
      END
    ELSE website
  END;

-- 2. Add missing columns
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Add constraints
ALTER TABLE businesses 
ADD CONSTRAINT IF NOT EXISTS valid_category 
CHECK (category IN (
  'Restaurant', 'Cafe', 'Hotel', 'Hospital', 'Clinic', 'Pharmacy',
  'Supermarket', 'Shopping', 'Gym', 'Salon', 'Car Repair', 'Electronics',
  'Education', 'Real Estate', 'Travel', 'Bank', 'Other'
));

ALTER TABLE businesses 
ADD CONSTRAINT IF NOT EXISTS valid_governorate 
CHECK (governorate IN (
  'Baghdad', 'Basra', 'Mosul', 'Erbil', 'Sulaymaniyah', 'Duhok',
  'Kirkuk', 'Najaf', 'Karbala', 'Hilla', 'Diyala', 'Anbar',
  'Salahuddin', 'Dhi Qar', 'Muthanna', 'Wasit', 'Babil', 'Qadisiyah'
));

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_governorate ON businesses(governorate);
CREATE INDEX IF NOT EXISTS idx_businesses_id ON businesses(id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_submitted_by ON businesses(submitted_by);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

-- 5. Update image field (use image_url if image is null)
UPDATE businesses 
SET image = COALESCE(image_url, image, 'https://picsum.photos/seed/' || id || '/400/300')
WHERE image IS NULL OR image = '';

-- 6. Set default values for existing records
UPDATE businesses 
SET 
  status = 'approved',
  verified = COALESCE(verified, FALSE),
  updated_at = COALESCE(updated_at, created_at, NOW())
WHERE status IS NULL;
