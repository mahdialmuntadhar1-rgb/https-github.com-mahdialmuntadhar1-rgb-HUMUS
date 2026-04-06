# BELIVE LAUNCH CHECKLIST

## 🟢 FRONTEND STATUS: READY
- ✅ Real Supabase connection
- ✅ Pagination (24 items/page)
- ✅ Filtering (category, governorate, city, search)
- ✅ Business detail modal
- ✅ Add business form
- ✅ Auth helpers integrated
- ✅ Trust signals (verified badges, call buttons)
- ✅ Loading skeletons & empty states

## 🟡 BACKEND STATUS: PREPARED, NEEDS EXECUTION

### SQL Scripts Created (Awaiting Execution)
1. `001_data_cleanup.sql` - Schema hardening & data cleanup
2. `002_rls_policies.sql` - Security policies  
3. `003_triggers.sql` - Auto-population & normalization

### Frontend Code Updated
- ✅ `supabaseClient.ts` - Auth helpers added
- ✅ `useBusinesses.ts` - whatsapp & verified field mapping

---

## 🚀 EXECUTION CHECKLIST

### Step 1: Run SQL Scripts in Supabase
[ ] Open Supabase SQL Editor
[ ] Run: `\i supabase/001_data_cleanup.sql`
[ ] Verify: "Query executed successfully"
[ ] Run: `\i supabase/002_rls_policies.sql`  
[ ] Verify: "Query executed successfully"
[ ] Run: `\i supabase/003_triggers.sql`
[ ] Verify: "Query executed successfully"

### Step 2: Verify Schema Changes
[ ] Check `businesses` table has new columns:
  - `whatsapp`
  - `image_url` 
  - `description`
  - `verified`
  - `submitted_by`
  - `status`
  - `updated_at`
[ ] Verify constraints exist for category & governorate
[ ] Verify indexes created

### Step 3: Test Core Functionality
[ ] Homepage loads businesses
[ ] "Load More" pagination works
[ ] Category filter works
[ ] Governorate filter works
[ ] Search works
[ ] Business detail modal opens
[ ] Add business form submits successfully

### Step 4: Test Security
[ ] Public users can read businesses
[ ] Authenticated users can submit businesses (status=pending)
[ ] Users cannot delete others' businesses
[ ] Phone numbers are normalized
[ ] URLs are auto-fixed with https://

### Step 5: Test Auth Flow
[ ] Sign up works
[ ] Sign in works
[ ] Sign out works
[ ] Session persists

---

## 🟢 GO / 🟡 NO-GO DECISION

### GO Conditions:
- All 3 SQL scripts executed successfully
- Homepage loads businesses without errors
- Add business form works
- Auth flow works
- RLS policies don't block expected operations

### NO-GO Conditions:
- Any SQL script fails
- Homepage fails to load
- Add business form fails
- Auth errors
- RLS blocks legitimate operations

---

## 🎯 LAUNCH READINESS

**Current Status:** 🟡 NEAR-READY

**Blocking Items:** SQL script execution + verification

**Estimated Time to GO:** 15-30 minutes (SQL execution + testing)

**Risk Level:** Low (changes are backward-compatible)

---

## 📝 POST-LAUNCH VERIFICATION

Once launched, verify:
- [ ] Performance with 1000+ businesses
- [ ] Filters work at scale
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Arabic/Kurdish text displays correctly

---

## 🚨 ROLLBACK PLAN

If issues arise:
1. Disable RLS: `ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;`
2. Restore backup if available
3. Remove triggers: `DROP TRIGGER businesses_insert_trigger; DROP TRIGGER businesses_update_trigger;`

---

**Final Verdict:** Backend hardening is prepared and safe. Execute SQL scripts, run verification tests, then launch.
