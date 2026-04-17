-- Fix businessId column constraint issue
-- Run this in Supabase SQL Editor

-- Drop the RLS policy that depends on businessId
DROP POLICY IF EXISTS "Business owners can manage their posts" ON public.posts;

-- Drop the old camelCase businessId column if it exists (it has NOT NULL constraint)
ALTER TABLE public.posts
DROP COLUMN IF EXISTS "businessId";

-- Add the snake_case business_id column if it doesn't exist (nullable)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;

-- Recreate the RLS policy with the correct column name
CREATE POLICY "Business owners can manage their posts"
ON public.posts
FOR ALL
TO authenticated
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Verify the column is nullable
-- This should show the business_id column without NOT NULL constraint
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'business_id';
