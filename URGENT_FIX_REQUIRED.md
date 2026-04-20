# 🚨 URGENT: RLS Policies Not Applied - 500 Errors

**Status**: Build mode code is correct, but Supabase database is misconfigured

**Error**: All database queries return HTTP 500 from Supabase
- `businesses` table: 500
- `posts` table: 500
- `profiles` table: 500
- `hero_slides` table: 500

**Root Cause**: RLS (Row Level Security) policies that allow public reads are NOT applied to the database.

---

## IMMEDIATE FIX (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://app.supabase.com/project/hsadukhmcclwixuntqwu
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Copy & Run the Setup Script
1. Open this file: `supabase/FINAL_PRODUCTION_SETUP.sql`
2. Copy **THE ENTIRE CONTENTS**
3. Paste into Supabase SQL Editor
4. Click **Run** button (or press Cmd+Enter)
5. **Wait for it to complete** (should show "Success" with green checkmark)

### Step 3: Verify
1. Reload the deployed app: https://belive-1cfz.vercel.app/
2. Check browser console (F12 → Console tab)
3. Verify NO 500 errors appear
4. Businesses should load
5. Posts should load
6. Hero slides should load

---

## What This Script Does

The `FINAL_PRODUCTION_SETUP.sql` file:

✅ Creates all required tables (if they don't exist):
- `profiles` (users + roles)
- `businesses` (company listings)
- `posts` (feed items)
- `comments`
- `claim_requests`
- `post_likes`
- `hero_slides` (homepage images)
- `features`

✅ Enables Row Level Security on all tables

✅ **CRITICAL:** Creates RLS policies allowing public reads:
```sql
-- Allows ANYONE to read businesses
CREATE POLICY "Public can read all businesses"
  ON businesses FOR SELECT
  USING (true);

-- Allows ANYONE to read visible posts
CREATE POLICY "Public can read visible posts"
  ON posts FOR SELECT
  USING (status = 'visible' OR status IS NULL);

-- Allows ANYONE to read hero slides
CREATE POLICY "Public can read hero slides"
  ON hero_slides FOR SELECT
  USING (true);
```

✅ Creates indexes for performance

✅ Sets up admin role checks for authenticated writes

---

## Why This Was Needed

The previous work (build mode activation) was **correct code-wise**, but the Supabase database wasn't configured to allow public reads. The RLS policies that permit this must be explicitly created in the database.

Think of it like:
- Code (Vercel): ✅ Correct
- Database (Supabase): ❌ Missing RLS policies

The SQL script **adds the missing RLS policies**.

---

## After Running the Script

**DO NOT:**
- Re-run it multiple times (it uses DROP POLICY IF EXISTS, so safe to re-run, but not needed)
- Modify the policies manually unless you know what you're doing

**DO:**
- The app will start working immediately
- All three content types (hero, posts, business) will work
- Owner inline editing will work
- Public reads will work

---

## If You See an Error

If the SQL script returns an error:

1. **"relation does not exist"** → Table wasn't created yet. Scroll up in Supabase and try again.
2. **"Permission denied"** → You may not have Supabase admin access. Check you're logged in as project owner.
3. **"Role already exists"** → Safe to ignore, re-run entire script.

Contact: The Supabase team can help if blocked

---

## Verification Checklist

After running the script:

- [ ] Load homepage: https://belive-1cfz.vercel.app/
- [ ] No 500 errors in console (F12)
- [ ] Businesses list appears
- [ ] Posts load in social feed
- [ ] Hero slide displays
- [ ] Can click to business details
- [ ] (If logged in as owner) Green FAB button visible
- [ ] (If logged in as owner) Can hover and edit content

---

## Timeline

- **Code changes**: ✅ DONE (Commit 4999ecf)
- **Database setup**: ⏳ NEED TO RUN SQL SCRIPT
- **Verification**: After script completes
- **Production ready**: Once all items above work

---

**ACTION REQUIRED**: Run the SQL script in Supabase. Nothing else needed.

Contact if errors occur.
