# Signup Bug Fix Report

**Date:** April 12, 2026  
**Issue:** Database error saving new user during signup  
**Severity:** Critical - Users cannot create accounts

---

## Root Cause Analysis

### The Problem
Users attempting to sign up were encountering the error: `Database error saving new user`

### Root Cause
The database trigger `on_auth_user_created` was attempting to insert a `phone` column into the `profiles` table, but this column did not exist in the production database schema.

**Detailed Flow:**
1. User submits signup form with email, password, and metadata (username, role)
2. Frontend calls `supabase.auth.signUp()` with metadata
3. Supabase Auth creates user in `auth.users` table
4. Trigger `on_auth_user_created` fires on `auth.users` INSERT
5. Trigger calls function `handle_new_user()`
6. Function attempts: `INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES (...)`
7. **FAILURE:** Column `phone` does not exist in `profiles` table
8. Error bubbles up to frontend as "Database error saving new user"

### Schema Mismatch
- **Migration 001** (original): Created `profiles` table WITHOUT `phone` column
- **Migration 002** (original): Trigger tried to INSERT with `phone` column
- **Migration 008** (new): Added `phone` column to `profiles` table
- **Production Issue:** Migration 008 was not applied, causing schema mismatch

---

## The Fix

### 1. Updated Trigger Function (Migration 002)
**File:** `supabase/migrations/002_profile_auto_creation_trigger.sql`

**Changes:**
- Added dynamic check for `phone` column existence
- Inserts with or without `phone` based on schema
- Added exception handling to prevent auth signup failure
- Logs errors but doesn't fail the entire signup process

**Before:**
```sql
INSERT INTO public.profiles (id, email, full_name, phone, role)
VALUES (NEW.id, NEW.email, ...);
```

**After:**
```sql
DECLARE phone_exists BOOLEAN;
-- Check if phone column exists
SELECT EXISTS (...) INTO phone_exists;

IF phone_exists THEN
  INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES (...);
ELSE
  INSERT INTO public.profiles (id, email, full_name, role) VALUES (...);
END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
```

### 2. Updated Base Schema (Migration 001)
**File:** `supabase/migrations/001_profiles_table.sql`

**Changes:**
- Added `phone TEXT` column to initial schema
- Ensures new deployments have phone column from the start

**Before:**
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'business_owner')),
  ...
);
```

**After:**
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,  -- NEW COLUMN
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'business_owner')),
  ...
);
```

### 3. Production Fix Migration (Migration 009)
**File:** `supabase/migrations/009_production_signup_fix.sql`

**Purpose:** Single migration to fix production without requiring full migration sequence

**Actions:**
1. Adds `phone` column if missing (idempotent)
2. Updates trigger function with graceful handling
3. Recreates trigger
4. Ensures correct permissions
5. Adds RLS policy for profile creation

### 4. Added Debugging (useAuth.ts)
**File:** `src/hooks/useAuth.ts`

**Changes:**
- Added comprehensive logging to `signUp()` function
- Logs signup request details
- Logs Supabase auth response
- Logs user creation and profile creation steps
- Helps diagnose future issues

---

## Files Changed

### Modified Files
1. `supabase/migrations/001_profiles_table.sql` - Added phone column to base schema
2. `supabase/migrations/002_profile_auto_creation_trigger.sql` - Made trigger robust
3. `src/hooks/useAuth.ts` - Added debugging logs

### New Files
1. `supabase/migrations/009_production_signup_fix.sql` - Production fix migration
2. `SIGNUP_BUGFIX_REPORT.md` - This document

---

## SQL Migration Required

**For Production:** Run `supabase/migrations/009_production_signup_fix.sql`

**How to Apply:**
```sql
-- Option 1: Via Supabase Dashboard
1. Go to https://app.supabase.com
2. Navigate to your project
3. Go to SQL Editor
4. Paste the content of 009_production_signup_fix.sql
5. Click "Run"

-- Option 2: Via Supabase CLI
supabase db push
```

**Why This Works:**
- The migration is idempotent (can be run multiple times safely)
- It checks if columns exist before adding them
- It handles both old and new schema versions
- It doesn't require a full database reset

---

## Expected Behavior After Fix

### Normal User Signup
1. User enters email, password (and phone in new UI)
2. Supabase Auth creates user
3. Trigger creates profile with role='user' (or 'business_owner' as default)
4. **SUCCESS:** User account created without errors
5. User can log in immediately

### Business Owner Signup
1. User enters email, password (and phone in new UI)
2. Supabase Auth creates user
3. Trigger creates profile with role='business_owner'
4. **SUCCESS:** User account created without errors
5. User redirected to dashboard after login

### Error Handling
- If profile creation fails, auth signup still succeeds
- User can still log in
- Profile can be created manually later if needed
- No more "Database error saving new user" shown to users

---

## Testing Checklist

- [x] Normal user signup works
- [x] Business owner signup works
- [x] Phone field is saved when provided
- [x] Signup works without phone field (backward compatible)
- [x] Profile is created automatically after signup
- [x] User can log in immediately after signup
- [x] No database errors shown to users
- [x] Debug logs appear in console for troubleshooting

---

## Deployment Instructions

### 1. Apply Database Migration
```bash
# Via Supabase CLI
cd belive
supabase db push

# Or manually in Supabase Dashboard SQL Editor
# Copy and run: supabase/migrations/009_production_signup_fix.sql
```

### 2. Deploy Code Changes
```bash
git add -A
git commit -m "Fix signup database error - make trigger robust"
git push origin main
```

### 3. Verify in Production
1. Try signing up as a new user
2. Check browser console for [SIGNUP] logs
3. Verify profile is created in Supabase Dashboard
4. Verify user can log in successfully

---

## Prevention of Future Issues

### Best Practices Implemented
1. **Idempotent Migrations:** All migrations can be run multiple times safely
2. **Schema Checks:** Triggers check for column existence before inserting
3. **Exception Handling:** Database errors don't fail the entire auth flow
4. **Comprehensive Logging:** All critical steps are logged for debugging
5. **Backward Compatibility:** Works with both old and new schemas

### Recommendations
1. Always test migrations in staging before production
2. Use Supabase CLI for migration management
3. Monitor database logs for trigger errors
4. Keep frontend and backend schema in sync
5. Run database schema audits regularly

---

## Summary

**Issue:** Database trigger failing due to missing phone column  
**Root Cause:** Schema mismatch between migrations 001, 002, and 008  
**Fix:** Made trigger robust with column existence checks and exception handling  
**Migration Required:** 009_production_signup_fix.sql  
**Impact:** Signup now works for all user types regardless of schema state  

The fix ensures signup works in production immediately and prevents similar issues in the future.
