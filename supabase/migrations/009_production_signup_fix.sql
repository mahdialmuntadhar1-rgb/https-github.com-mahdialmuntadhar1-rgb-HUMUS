-- Migration 009: Production Signup Fix
-- This migration fixes the "Database error saving new user" issue
-- It ensures the profiles table has the phone column and the trigger handles it gracefully

-- Step 1: Add phone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    COMMENT ON COLUMN public.profiles.phone IS 'User phone number for simplified registration flow';
  END IF;
END $$;

-- Step 2: Update the trigger function to handle missing phone column gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  phone_exists BOOLEAN;
BEGIN
  -- Check if phone column exists in profiles table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) INTO phone_exists;

  -- Insert profile with or without phone column based on schema
  IF phone_exists THEN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'business_owner')
    );
  ELSE
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'business_owner')
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth signup
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Ensure permissions are correct
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Step 5: Ensure RLS policies allow profile creation
DROP POLICY IF EXISTS "Enable profile creation for new users" ON public.profiles;
CREATE POLICY "Enable profile creation for new users"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile row when a new user signs up via Supabase Auth. Handles missing phone column gracefully.';
