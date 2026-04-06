# BELIVE FINAL LAUNCH BLOCKER CHECKLIST

## 🔴 HARD NO-GO BLOCKERS (Must Pass)

### 1. Live Data Loading
- [ ] Homepage loads real businesses from Supabase
- [ ] No blank page
- [ ] No infinite spinner
- [ ] No console errors for businesses
- [ ] Network requests return 200

### 2. Correct Backend Target
- [ ] App calling correct Supabase project URL
- [ ] No old/broken Supabase host in Network tab
- [ ] Correct anon key in deployed build
- [ ] No service role key exposed client-side

### 3. Runtime Stability
- [ ] No "Cannot read properties of undefined" errors
- [ ] Feed renders even if related business is missing
- [ ] Business detail modal does not crash on missing fields
- [ ] Dashboard pages do not crash on null/undefined data

### 4. Filtering Logic
- [ ] Governorate filter works
- [ ] Category filter works
- [ ] Governorate + category together works
- [ ] "All" state works
- [ ] No false "No businesses found" when data exists
- [ ] Dropdown changes actually update results

### 5. Data Quality
- [ ] Uploaded dataset uses exact Supabase schema columns
- [ ] No 400 upload errors from unknown columns
- [ ] Categories normalized to frontend values
- [ ] Governorates normalized consistently
- [ ] Phone values standardized
- [ ] Duplicates removed
- [ ] Not too many businesses stuck in "general"

### 6. Pagination / Load More
- [ ] First page loads
- [ ] Load More fetches next page
- [ ] No duplicate cards after multiple loads
- [ ] Count/progress updates correctly if shown
- [ ] Pagination does not silently replace previous results

### 7. Business Cards / Details
- [ ] Cards are clickable
- [ ] Detail modal/page opens
- [ ] Phone button works only when phone exists
- [ ] WhatsApp button works only when WhatsApp exists
- [ ] Website button works only when website exists
- [ ] No dead # links shown as real actions

### 8. Add Business Flow
- [ ] Modal opens
- [ ] Form validates required fields
- [ ] Insert payload matches DB schema exactly
- [ ] Submission succeeds or fails clearly
- [ ] No unsafe anonymous write path if not intended
- [ ] If not fully tested, hide it before launch

### 9. Posts / Feed
- [ ] Posts load without 401/403
- [ ] Joined business info does not crash feed
- [ ] Missing business references degrade gracefully
- [ ] If feed is unstable, hide it before launch

### 10. Auth / Security
- [ ] Login works
- [ ] Signup works
- [ ] Logout works
- [ ] Public browsing does not require login
- [ ] RLS policies allow intended public reads
- [ ] RLS policies block unintended destructive writes
- [ ] Users cannot edit/delete other users' data

### 11. Deployment / Build
- [ ] Latest deployed build matches latest repo state
- [ ] Vercel/host is not serving stale build
- [ ] Env changes were actually picked up by a rebuild
- [ ] Hard refresh / incognito shows current build behavior

### 12. Mobile Usability
- [ ] Homepage works on mobile width
- [ ] Filters are tappable
- [ ] Cards are readable
- [ ] Modals are usable
- [ ] No overflow / broken layout

### 13. Trust / Product Readiness
- [ ] Businesses shown have believable names
- [ ] Not too many ugly placeholders / nulls
- [ ] Core categories return meaningful results
- [ ] At least a few major governorates feel populated
- [ ] App feels stable enough for first-time visitors

---

## 🟡 SOFT LAUNCH BLOCKERS (Can Launch With These Hidden)

- [ ] Feed/posts unstable → Hide if needed
- [ ] Add Business not fully verified → Hide if needed
- [ ] Too much data still under general → Acceptable for launch
- [ ] Mobile still rough in some screens → Acceptable for launch
- [ ] Some buttons exist but not meaningful yet → Hide if needed

---

## ✅ SAFE LAUNCH MODE (Minimum Viable Launch)

Launch with ONLY these features if needed:
- [x] Browse businesses
- [x] Governorate/category filtering  
- [x] Load More
- [x] Business details
- [x] Phone/WhatsApp/website actions

Hide temporarily if unstable:
- [ ] Posts/feed
- [ ] Add Business
- [ ] Auth-only features
- [ ] Owner dashboard

---

## 🚨 FINAL STRICT RULE

**Launch only if these 5 are true:**
1. ✅ Correct deployed Supabase target
2. ✅ Businesses load
3. ✅ Filters work
4. ✅ No runtime crash
5. ✅ Core browse flow feels stable

---

## 📋 CURRENT STATUS BASED ON CODE AUDIT

### ✅ ALREADY PASSING
- Homepage structure and layout
- Business grid rendering
- Pagination logic
- Filter application logic
- Business detail modal
- Mobile responsive design
- Auth system structure (needs profiles table)

### ⚠️ NEEDS VERIFICATION
- Supabase connection in production
- RLS policies applied
- Data quality in live DB
- Auth flow with profiles table
- Add Business submission
- Posts/feed stability

### 🔴 CRITICAL SQL NEEDED BEFORE LAUNCH
```sql
-- Execute in Supabase SQL Editor:
\i supabase/005_profiles_table.sql
\i supabase/fix_401_errors.sql
\i supabase/001_data_cleanup.sql
\i supabase/002_rls_policies.sql
\i supabase/003_triggers.sql
```

---

## 🎯 LAUNCH DECISION

**Current Readiness: 85%**

**Blockers:**
1. SQL scripts need execution
2. Production Supabase connection verification
3. Data quality verification
4. End-to-end testing

**Recommendation:** Complete SQL execution and verification, then launch.
