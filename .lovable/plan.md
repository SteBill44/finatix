

## Plan: Embed PDF in "Introduction to National Income" Lesson

### What we'll do

1. **Copy the uploaded PDF** to the project's `public/` folder so it's accessible via URL
2. **Update the lesson content** in the database with an embedded PDF viewer using an `<iframe>` tag
3. **Update the HTML sanitizer** to allow `<iframe>` tags (currently in the FORBID list) — scoped only to same-origin/trusted sources
4. **Add styling** for a scrollable PDF embed container in the lesson content area

### Technical details

- **PDF location**: Copy `user-uploads://Finatix_CIMA_BA1_Chapter_1.pdf` → `public/pdfs/Finatix_CIMA_BA1_Chapter_1.pdf`
- **Sanitizer change** (`src/lib/sanitize.ts`): Add `iframe` to `ALLOWED_TAGS`, add `src`, `style`, `allowfullscreen` to `ALLOWED_ATTR`, remove `iframe` from `FORBID_TAGS`
- **Lesson content update**: Set the `content` column of lesson `ac52b14f-193b-4013-8cda-a4fd3a9502f3` to HTML containing a styled scrollable iframe pointing to the PDF
- **Styling**: The iframe will be set to `width: 100%; height: 80vh; border: none; border-radius: 8px;` for a clean scrollable PDF reading experience

