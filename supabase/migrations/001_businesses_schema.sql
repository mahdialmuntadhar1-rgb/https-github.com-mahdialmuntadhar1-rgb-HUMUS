-- BUSINESS TABLE SCHEMA MIGRATION
-- Ensures all required fields for frontend features

-- 1. Add missing columns if they don't exist
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS name_ku TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS opening_hours TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web_form';

-- 2. Create canonical category constraint
ALTER TABLE businesses 
ADD CONSTRAINT IF NOT EXISTS valid_category 
CHECK (category IN (
  'Restaurant', 'Cafe', 'Hotel', 'Hospital', 'Clinic', 'Pharmacy',
  'Supermarket', 'Shopping', 'Gym', 'Salon', 'Car Repair', 'Electronics',
  'Education', 'Real Estate', 'Travel', 'Bank', 'Other'
));

-- 3. Create canonical governorate constraint
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
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_moderation_status ON businesses(moderation_status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_submitted_by ON businesses(submitted_by);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

-- 5. Clean up dirty data
UPDATE businesses 
SET 
  category = 'Other' 
WHERE category IS NULL OR 
      category IN ('unknown', 'n/a', 'null', '-', '--', 'N/A', '') OR
      TRIM(category) = '';

UPDATE businesses 
SET 
  governorate = 'Baghdad' 
WHERE governorate IS NULL OR 
      governorate IN ('unknown', 'n/a', 'null', '-', '--', 'N/A', '') OR
      TRIM(governorate) = '';

UPDATE businesses 
SET 
  moderation_status = 'approved',
  is_verified = FALSE
WHERE moderation_status IS NULL;

-- 6. Update timestamps
UPDATE businesses 
SET 
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;
