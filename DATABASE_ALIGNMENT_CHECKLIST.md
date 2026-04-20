# Database Alignment Verification Checklist

**Project**: hsadukhmcclwixuntqwu  
**Frontend Status**: ✅ DEPLOYED & WAITING FOR DB  
**Database Status**: ⏳ READY TO CONFIGURE

---

## Pre-Execution Verification

- [ ] Have access to Supabase project dashboard
- [ ] Know project ID: `hsadukhmcclwixuntqwu` ✓
- [ ] Know Vercel deployment: https://belive-1cfz.vercel.app/ ✓
- [ ] Downloaded/have access to SQL files in repo

---

## Execution Checklist

### Phase 1: Run FINAL_PRODUCTION_SETUP.sql

**Expected Tables Created**:
- [ ] profiles (with role column)
- [ ] businesses (with image_url column)
- [ ] posts (with image_url, status columns)
- [ ] comments
- [ ] claim_requests
- [ ] post_likes
- [ ] hero_slides (with image_url column)
- [ ] features

**Expected RLS Policies**:
- [ ] profiles: 4 policies (read own, update own, insert own, admin read all)
- [ ] businesses: 4 policies (public read, owner update, owner insert, admin all)
- [ ] posts: 5 policies (public visible, auth read all, auth create, owner update, owner delete, admin all)
- [ ] comments: 4 policies (public read, auth create, user update/delete own)
- [ ] claim_requests: 3 policies (auth create, user read own, admin all)
- [ ] post_likes: 3 policies (public read, auth like, user unlike own)
- [ ] hero_slides: 2 policies (public read, admin manage)
- [ ] features: 2 policies (public read, admin manage)

**Expected Indexes**:
- [ ] idx_posts_status
- [ ] idx_posts_business_id
- [ ] idx_posts_created_at
- [ ] idx_posts_likes
- [ ] idx_businesses_owner_id
- [ ] idx_businesses_governorate
- [ ] idx_businesses_category
- [ ] idx_hero_slides_sort_order
- [ ] idx_claim_requests_status
- [ ] idx_claim_requests_business_id

**Status After Phase 1**: Basic schema created, 500 errors persist (RLS policies too restrictive)

---

### Phase 2: Run 020_MISSING_TABLES_AND_FUNCTIONS.sql

**Expected Tables Created**:
- [ ] governorates (with 18 rows of seed data)
- [ ] cities (empty, ready for admin data entry)
- [ ] categories (with 5 rows of seed data)
- [ ] reviews
- [ ] likes (CRITICAL: frontend uses this, not post_likes)

**Expected RLS Policies**:
- [ ] governorates: 2 policies (public read, admin manage)
- [ ] cities: 2 policies (public read, admin manage)
- [ ] categories: 2 policies (public read, admin manage)
- [ ] reviews: 5 policies (public read, auth create, user update/delete own, admin manage)
- [ ] likes: 3 policies (public read, auth insert, user delete own)

**Expected RPC Functions**:
- [ ] `increment_likes(post_id UUID)` - adds 1 to posts.likes
- [ ] `decrement_likes(post_id UUID)` - subtracts 1 from posts.likes (min 0)

**Expected Seed Data**:
- [ ] 18 governorates (Baghdad, Basra, Erbil, Dohuk, etc.)
- [ ] 5 sample categories (Hotels, Restaurants, Shopping, Entertainment, Services)

**Expected Indexes**:
- [ ] idx_cities_governorate_id
- [ ] idx_categories_name_en
- [ ] idx_reviews_business_id
- [ ] idx_reviews_user_id
- [ ] idx_likes_post_id
- [ ] idx_likes_user_id

**Status After Phase 2**: Core tables + missing tables exist, RLS policies should allow reads now

---

### Phase 3: Run 010_auth_trigger.sql

**Expected Function**:
- [ ] `handle_new_user()` - auto-creates profile row when user signs up

**Expected Trigger**:
- [ ] `on_auth_user_created` - fires AFTER INSERT on auth.users

**Expected RLS Policies** (may overlap with FINAL):
- [ ] profiles: read own, update own, insert own, admin read all

**Status After Phase 3**: User signup automation enabled

---

### Phase 4: Create Storage Buckets (Manual)

**Expected Buckets**:
- [ ] hero-images (Public)
- [ ] feed-images (Public)
- [ ] business-images (Public)

**In Supabase Dashboard**:
1. Navigate to: Storage section
2. Create bucket: "hero-images"
   - [ ] Name: `hero-images`
   - [ ] Privacy: Public
   - [ ] Click: Create

3. Create bucket: "feed-images"
   - [ ] Name: `feed-images`
   - [ ] Privacy: Public
   - [ ] Click: Create

4. Create bucket: "business-images"
   - [ ] Name: `business-images`
   - [ ] Privacy: Public
   - [ ] Click: Create

**Status After Phase 4**: Storage ready for image uploads

---

## Post-Execution Verification

### Database Verification Query

Run this SQL in Supabase to verify all tables exist:

```sql
SELECT 
  'profiles' AS table_name, COUNT(*) AS row_count FROM profiles
UNION ALL SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'comments', COUNT(*) FROM comments
UNION ALL SELECT 'claim_requests', COUNT(*) FROM claim_requests
UNION ALL SELECT 'post_likes', COUNT(*) FROM post_likes
UNION ALL SELECT 'hero_slides', COUNT(*) FROM hero_slides
UNION ALL SELECT 'features', COUNT(*) FROM features
UNION ALL SELECT 'governorates', COUNT(*) FROM governorates
UNION ALL SELECT 'cities', COUNT(*) FROM cities
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'likes', COUNT(*) FROM likes;
```

**Expected Result**:
```
profiles | 0
businesses | 0
posts | 0
comments | 0
claim_requests | 0
post_likes | 0
hero_slides | 0
features | 0
governorates | 18
cities | 0
categories | 5
reviews | 0
likes | 0
```

- [ ] All 13 tables present
- [ ] governorates has 18 rows (seed data)
- [ ] categories has 5 rows (seed data)

### App Verification

- [ ] Open: https://belive-1cfz.vercel.app/
- [ ] Open DevTools: F12 → Console tab
- [ ] Check: NO HTTP 500 errors
- [ ] Verify: Businesses section loads (shows fallback data if no DB businesses)
- [ ] Verify: Social feed loads
- [ ] Verify: Hero image on homepage displays
- [ ] Verify: Category filters work (shows 5 sample categories)
- [ ] Verify: Governorate dropdown works (shows 18 Iraqi governorates)

### Owner Verification (if logged in as mahdialmuntadhar1@gmail.com)

- [ ] Green FAB button appears bottom-right
- [ ] Can hover over hero image → "Edit Image" appears
- [ ] Can upload new hero image
- [ ] Can hover over post → edit/delete icons appear
- [ ] Can edit post caption
- [ ] Can upload new post image
- [ ] Can delete post
- [ ] Can hover over business card → edit icons appear
- [ ] Can edit business name/phone
- [ ] Can upload business logo

---

## Troubleshooting

### All Tables Missing or Foreign Key Errors
**Cause**: FINAL_PRODUCTION_SETUP.sql didn't run successfully  
**Action**: 
- [ ] Check SQL Editor output for errors
- [ ] Copy FINAL_PRODUCTION_SETUP.sql again
- [ ] Paste into NEW query
- [ ] Click Run
- [ ] Wait for ✓ Success

### Error: "duplicate key value violates unique constraint"
**Cause**: Script ran twice  
**Action**: Safe to ignore (uses CREATE IF NOT EXISTS)

### App still shows 500 errors
**Cause**: Storage buckets don't exist OR RLS policies incomplete  
**Action**:
- [ ] Verify 3 storage buckets exist (Storage section)
- [ ] Check which specific query fails (DevTools Network tab)
- [ ] Re-run 020_MISSING_TABLES_AND_FUNCTIONS.sql

### Governorates dropdown empty (but categories work)
**Cause**: Governorates table empty (seed data didn't insert)  
**Action**:
- [ ] Run verification query above
- [ ] If governorates count = 0, re-run 020_MISSING_TABLES_AND_FUNCTIONS.sql
- [ ] Check for INSERT errors in SQL output

### RPC functions not found ("function does not exist")
**Cause**: 020_MISSING_TABLES_AND_FUNCTIONS.sql didn't complete  
**Action**:
- [ ] Scroll up in SQL output
- [ ] Check for errors in CREATE OR REPLACE FUNCTION section
- [ ] Re-run 020_MISSING_TABLES_AND_FUNCTIONS.sql

---

## Final Sign-Off

### All Checks Completed?

- [ ] Phase 1 (FINAL_PRODUCTION_SETUP.sql) - ✓ Success
- [ ] Phase 2 (020_MISSING_TABLES_AND_FUNCTIONS.sql) - ✓ Success
- [ ] Phase 3 (010_auth_trigger.sql) - ✓ Success
- [ ] Phase 4 (Storage buckets) - ✓ Created
- [ ] Verification query passed - ✓ All 13 tables present
- [ ] App loads without 500 errors - ✓ Success
- [ ] Content appears (businesses, posts, hero) - ✓ Success
- [ ] Storage buckets exist - ✓ 3 public buckets ready

### Status

**PRODUCTION READY** ✅

Database is fully aligned with deployed frontend.

---

## Rollback Plan (if needed)

If major issues occur and you need to reset:

```sql
-- WARNING: This deletes everything
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS governorates CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS claim_requests CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS hero_slides CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP FUNCTION IF EXISTS increment_likes(UUID);
DROP FUNCTION IF EXISTS decrement_likes(UUID);
DROP FUNCTION IF EXISTS handle_new_user();

-- Then re-run all 3 SQL files in order
```

**DO NOT USE** unless absolutely necessary. All SQL files use DROP IF EXISTS, so re-running them is safer.

---

**Completion Date**: [Enter after execution]  
**Verified By**: [Your name]  
**Status**: ⏳ PENDING EXECUTION
