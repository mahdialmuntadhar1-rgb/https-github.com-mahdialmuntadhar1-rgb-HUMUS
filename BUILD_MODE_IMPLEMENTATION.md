# Build Mode Implementation Guide

## Overview

Build Mode is a simple inline editing system that allows only the owner (`mahdialmuntadhar1@gmail.com`) to edit content directly on the homepage without needing to access admin dashboards.

## Features Implemented

### 1. **useBuildMode Hook** 
- Location: `src/hooks/useBuildMode.ts`
- Checks if logged-in user matches the Build Mode email
- Returns `isBuildModeEnabled` boolean
- Used by all editable components to conditionally show edit UI

### 2. **EditableHeroSection Component**
- Location: `src/components/buildMode/EditableHeroSection.tsx`
- Replaces HeroSection when Build Mode is enabled
- On hover: Shows "Edit Image" button
- On click: Opens file picker to upload new hero image
- Saves directly to Supabase storage (`hero-images` bucket)
- Updates `hero_slides` table with new image URL
- Persists across page refreshes

### 3. **EditablePost Component**
- Location: `src/components/buildMode/EditablePost.tsx`
- Wraps each post in the social feed
- On hover: Shows 3 action buttons:
  - ✏️ Edit caption (pencil icon)
  - 🖼️ Replace image (blue pencil)
  - 🗑️ Delete post (red X)
- Edit caption: Opens modal to edit text, saves to DB
- Replace image: Upload new image, updates post
- Delete post: Removes post from DB and UI
- All changes persist immediately

### 4. **AddPostButton Component**
- Location: `src/components/buildMode/AddPostButton.tsx`
- Floating button (bottom-right) only visible when Build Mode is enabled
- Opens modal with:
  - Image uploader (drag-drop style)
  - Caption textarea
  - Publish button
- Creates new post in `posts` table
- Saves image to Supabase storage (`feed-images` bucket)
- New posts appear immediately in feed

## Integration Points

### HomePage.tsx
- Imports `useBuildMode`, `useAdminDB`, `EditableHeroSection`, `AddPostButton`
- Checks `isBuildModeEnabled` to show editable hero or normal hero
- Loads hero slides and manages hero carousel state
- Renders `AddPostButton` when on 'social' tab and Build Mode is enabled

### SocialFeed.tsx
- Imports `EditablePost` wrapper component
- Wraps each post with `EditablePost`
- Passes `onUpdate` callback to handle post updates/deletions
- Manages local `displayPosts` state for immediate UI updates

## Database Requirements

### Storage Buckets (Public)
- `hero-images` - for hero section images
- `feed-images` - for post images
- `business-images` - for business listings (future)

### Table Columns Used
- `hero_slides`: `id`, `image_url`
- `posts`: `id`, `content`, `image`, `user_id`, `status`, `created_at`, `likes`
- `businesses`: (for future business editing)

## Access Control

**Build Mode Email:** `mahdialmuntadhar1@gmail.com`

Only this email address can:
- See edit buttons on hover
- Upload new hero images
- Edit post captions
- Replace post images
- Delete posts
- Create new posts via floating button

All other users see:
- Normal homepage without any edit UI
- Standard post view without edit options
- No floating button

## How to Use

### As Owner (mahdialmuntadhar1@gmail.com)

1. **Edit Hero Image:**
   - Login with your email
   - Hover over hero section
   - Click "Edit Image" button
   - Select new image file
   - Image auto-uploads and persists

2. **Edit Posts:**
   - Hover over any post in Shaku Maku feed
   - Click pencil icon to edit caption
   - Click blue pencil to replace image
   - Click red X to delete post
   - Changes save immediately

3. **Add New Post:**
   - Go to Shaku Maku tab
   - Click floating "+" button (bottom-right)
   - Upload image and add caption
   - Click "Publish"
   - Post appears instantly in feed

### As Regular User
- No edit buttons appear
- Fully functional read-only experience
- All updates made by owner are visible in real-time

## File Structure

```
src/
├── hooks/
│   └── useBuildMode.ts                (new)
├── components/
│   └── buildMode/
│       ├── EditableHeroSection.tsx     (new)
│       ├── EditablePost.tsx            (new)
│       └── AddPostButton.tsx           (new)
├── pages/
│   ├── HomePage.tsx                    (modified - added Build Mode)
│   └── home/
│       └── SocialFeed.tsx              (modified - wrapped posts)
```

## Technical Details

### Image Upload Flow
1. User selects file from input
2. File uploaded to Supabase Storage with timestamp-based filename
3. Public URL retrieved via `getPublicUrl()`
4. Database updated with public URL
5. Local React state updated
6. UI re-renders with new image

### State Management
- Component-level state (`useState`) for modal visibility
- Supabase as single source of truth for data
- Real-time updates via direct DB queries
- No polling or WebSocket subscriptions needed

### Error Handling
- Try-catch blocks around Supabase calls
- User-friendly alert messages
- Failed uploads don't update UI
- Original data preserved on error

## Future Enhancements

1. **Business Listing Editing**
   - Wrap business cards with `EditableBusinessCard`
   - Allow editing name, phone, image
   - Requires `business-images` storage bucket

2. **Category Title Editing**
   - Make category section headers editable
   - Store in `categories` table

3. **Batch Operations**
   - Multi-select posts for bulk delete
   - Reorder hero slides via drag-drop

4. **Undo/Redo**
   - Stack-based history
   - Restore previous versions

5. **Analytics**
   - Track edits by owner
   - Log all changes with timestamps

## Testing Checklist

- [ ] Login with owner email → edit buttons visible
- [ ] Login with other email → no edit buttons
- [ ] Hover hero section → "Edit Image" appears
- [ ] Click "Edit Image" → file picker opens
- [ ] Upload new hero image → persists after refresh
- [ ] Hover post → 3 action buttons appear
- [ ] Click edit caption → modal opens, can edit text
- [ ] Save caption → updates in DB and UI
- [ ] Click replace image → file picker opens
- [ ] Upload new post image → updates immediately
- [ ] Click delete → confirmation modal, post removed
- [ ] Click "+" button → new post modal opens
- [ ] Upload image and caption → post appears in feed
- [ ] Logout and login as other user → no edit UI
- [ ] Logout and login as owner again → edit UI visible

## Support & Troubleshooting

### Images Not Uploading
- Check Supabase Storage buckets exist and are public
- Check bucket names match: `hero-images`, `feed-images`
- Verify user has storage permissions

### Changes Not Persisting
- Check Supabase connection
- Verify RLS policies allow authenticated user writes
- Check browser console for error messages

### Edit Buttons Not Showing
- Verify logged-in email is exactly `mahdialmuntadhar1@gmail.com`
- Check `useBuildMode` hook is working via React DevTools
- Clear browser cache and refresh

## Contact

For issues or feature requests, contact the development team.
