# Quick Start: Build Mode Testing

## Setup (One-Time)

### 1. Verify Supabase Storage Buckets
Go to your Supabase Dashboard → Storage:
- ✅ Create `hero-images` bucket (public)
- ✅ Create `feed-images` bucket (public)

### 2. Environment Ready
Your app is running locally at `http://localhost:3000`

## Test Build Mode

### Step 1: Login as Owner
1. Click "تسجيل الدخول" (Login) in header
2. Enter email: `mahdialmuntadhar1@gmail.com`
3. Set a password and confirm login

### Step 2: Test Hero Image Editing
1. **Hover** over the hero image section at the top
2. You should see an **"Edit Image"** button appear
3. Click it and select a new image file
4. Image uploads to Supabase and displays immediately
5. **Refresh the page** → New image persists ✅

### Step 3: Test Post Editing (Shaku Maku Feed)
1. Click the **"Shaku Maku"** tab to see the social feed
2. **Hover** over any post
3. You should see **3 small icons** appear (top-right):
   - ✏️ **Gray pencil** = Edit caption
   - ✏️ **Blue pencil** = Replace image
   - ❌ **Red X** = Delete post

4. **Test Edit Caption:**
   - Click gray pencil
   - Modal opens with caption text
   - Edit the text
   - Click "Save"
   - Text updates in post immediately ✅

5. **Test Replace Image:**
   - Click blue pencil
   - Select new image file
   - Image replaces in post instantly ✅

6. **Test Delete:**
   - Click red X
   - Confirm in dialog
   - Post disappears from feed ✅

### Step 4: Test Add New Post
1. In Shaku Maku tab, look for floating **"+"** button (bottom-right)
2. Click it to open new post modal
3. Upload image (or drag-drop)
4. Add caption text
5. Click "Publish"
6. Post appears at top of feed immediately ✅

### Step 5: Verify Access Control
1. **Logout** (click account → logout)
2. **Login with different email** (any other email)
3. Hover over hero, posts, etc.
   - ❌ **No edit buttons appear**
   - ❌ No floating "+" button
   - ✅ Normal read-only experience

4. **Logout** and **login again as** `mahdialmuntadhar1@gmail.com`
   - ✅ Edit buttons reappear

## What's Working ✅

- [x] Hero image editing (hover → edit → save → persist)
- [x] Post caption editing (inline modal editing)
- [x] Post image replacement
- [x] Post deletion
- [x] New post creation via floating button
- [x] Immediate Supabase updates
- [x] Access control (only owner sees edit UI)
- [x] Bilingual support (English/Arabic)

## Common Issues & Fixes

### Issue: Edit buttons don't appear
**Solution:** 
- Verify you're logged in with `mahdialmuntadhar1@gmail.com`
- Check React DevTools → check `isBuildModeEnabled` is `true`
- Clear browser cache and refresh

### Issue: Images don't upload
**Solution:**
- Verify Supabase storage buckets exist and are **public**
- Check bucket names: `hero-images` and `feed-images`
- Check browser console for errors

### Issue: Changes not persisting after refresh
**Solution:**
- Check Supabase connection is working
- Verify RLS policies allow authenticated user writes
- Check API response in Network tab

## Code Files Ready to Deploy

```
src/
├── hooks/
│   └── useBuildMode.ts                ✅ Clean
├── components/
│   └── buildMode/
│       ├── EditableHeroSection.tsx     ✅ Clean  
│       ├── EditablePost.tsx            ✅ Clean
│       └── AddPostButton.tsx           ✅ Clean
├── pages/
│   ├── HomePage.tsx                    ✅ Updated
│   └── home/
│       └── SocialFeed.tsx              ✅ Updated
```

## Next: Deploy to Production

Once testing is complete:
1. Push code to GitHub
2. Deploy to Vercel/production environment
3. Verify Supabase buckets are public in production
4. Test with production database

## Questions?

See `BUILD_MODE_IMPLEMENTATION.md` for detailed documentation.
