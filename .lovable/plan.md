

# Admin Drag-and-Drop Image Replacement

## Overview
Create a reusable wrapper that lets admins update any image on the site by simply dragging and dropping a new image file onto it. Non-admin users see images normally with no change.

## How It Works
When an admin is logged in, hovering over any "editable" image shows a subtle overlay hint. Dragging an image file onto it uploads to storage and updates the database record automatically.

## Technical Approach

### 1. Create `AdminImageDropZone` wrapper component
A new component (`src/components/admin/AdminImageDropZone.tsx`) that:
- Wraps any image element (including `OptimizedImage`)
- Checks `useIsAdmin()` — if not admin, renders children with zero overhead
- On drag-over, shows a translucent overlay with "Drop to replace" text
- On drop, uploads the file to the `resources` storage bucket under `site-images/`
- Calls an `onImageUpdated(newUrl)` callback so the parent can persist the change (e.g., update the course record)
- Shows a loading spinner during upload and a toast on success/failure

### 2. Integrate on Courses page (`src/pages/Courses.tsx`)
- Add course card images (they currently don't render `image_url`) wrapped in `AdminImageDropZone`
- On drop, update the course's `image_url` in the `courses` table and invalidate the query cache

### 3. Integrate on Homepage CourseLevels (`src/components/home/CourseLevels.tsx`)
- The 3 step images are currently static imports — wrap each in `AdminImageDropZone`
- Store replacement URLs in a `site_settings` or `site_images` table keyed by identifier (e.g., `"course-step-1"`)
- Fall back to the static import if no override exists in the database

### 4. Create `site_images` table (migration)
```sql
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  image_url text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
-- Anyone can read
CREATE POLICY "Public read" ON public.site_images FOR SELECT USING (true);
-- Only admins can modify
CREATE POLICY "Admin write" ON public.site_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### 5. Create `useSiteImage` hook
Fetches an image URL by key from `site_images`, returns the override URL or the fallback static asset. Used by homepage sections.

### 6. Integrate on CourseDetail page
Wrap the course hero/banner image with `AdminImageDropZone` — updates the `courses.image_url` field directly.

## Files to Create/Edit
- **New**: `src/components/admin/AdminImageDropZone.tsx` — reusable drop wrapper
- **New**: `src/hooks/useSiteImages.ts` — hook to fetch overridable site images
- **Migration**: Create `site_images` table
- **Edit**: `src/pages/Courses.tsx` — add course card images with drop zone
- **Edit**: `src/components/home/CourseLevels.tsx` — wrap step images
- **Edit**: `src/pages/CourseDetail.tsx` — wrap course hero image

