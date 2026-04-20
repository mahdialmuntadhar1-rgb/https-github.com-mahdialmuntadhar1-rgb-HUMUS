# Quick Deployment Steps - Supabase 500 Fixes

## ✅ Code Changes Complete
Git commit: `0e7ac36 - fix: resolve Supabase 500 errors and restore owner edit data`

## Step 1: Database Migration (REQUIRED)

**In Supabase SQL Editor** (https://app.supabase.com):

```sql
-- Add missing columns to hero_slides table
ALTER TABLE hero_slides 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_hero_slides_display_order ON hero_slides(display_order);
```

**Verify** by running:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'hero_slides' 
  AND column_name IN ('is_active', 'display_order');
```

Should return 2 rows.

---

## Step 2: Deploy Code

**Push to main** (if not already done):
```bash
git push origin main
```

Vercel auto-deploys. Monitor at: https://vercel.com/dashboard

---

## Step 3: Verify

**Test these 4 things**:

1. **Homepage** (https://belive-1cfz.vercel.app/):
   - Featured businesses load ✓
   - Posts/Feed works ✓
   - No errors ✓

2. **Owner Login** (mahdialmuntadhar1@gmail.com):
   - Green "Edit Mode" button appears ✓
   - Button is in bottom-right corner ✓

3. **Click Button**:
   - Panel slides in ✓
   - Shows "Hero Slides" tab ✓
   - Data loads (no spinner stuck) ✓

4. **Non-Owner**:
   - No green button ✓
   - Everything else works ✓

---

## ✨ Done!

All Supabase 500 errors fixed. Owner edit mode now loads real data.
