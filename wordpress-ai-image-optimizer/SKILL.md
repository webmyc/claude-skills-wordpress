# WordPress AI Image Optimizer

AI-powered image optimization for WordPress sites. Automatically compresses, converts formats, renames files, and updates all references. Processes images locally in AI code editor, creates optimized versions, and preserves originals for safety.

## What This Skill Does

**Scans:**
- All media library images
- Images in posts and pages content
- Featured images
- Images in page builder elements (Elementor, Divi, Bricks, etc.)
- WooCommerce product images
- Images in custom post types

**Detects:**
- File sizes (actual KB/MB on disk)
- Image dimensions (width x height in pixels)
- Format (JPG, PNG, GIF, WebP, AVIF, SVG)
- Whether width/height attributes are set in HTML
- Whether alt text exists (and quality)
- Whether image is being used (orphaned media)
- Whether responsive image sizes exist (WordPress srcset)
- Compression quality (estimated from file size)
- Lazy loading implementation
- Non-SEO-friendly filenames (IMG_1234.jpg, screenshot.png, etc.)
- Oversized originals (5000px uploaded when 2000px is max needed)
- Missing srcset on content images
- Builder images that bypass WordPress responsive system

**Optimizes via AI Code Editor:**
- Downloads images from WordPress
- Compresses with optimal quality settings (80-85% for JPG, lossless for PNG)
- Converts to modern formats (WebP preferred, AVIF when appropriate)
- Resizes oversized originals to optimal dimensions
- Renames with SEO-friendly descriptive filenames
- Generates missing alt text using AI
- Regenerates WordPress responsive image sizes
- Uploads optimized versions back to WordPress
- Creates new media entries (keeps old files safe)
- Updates all content references in duplicates

**Provides:**
- Comprehensive image health score (0-100)
- Impact-prioritized optimization opportunities
- Before/after file size comparisons
- Estimated page speed improvements
- Plugin/CDN detection and recommendations

## Requirements

- Respira for WordPress plugin installed and connected
- MCP connection active (desktop or WebMCP)
- AI code editor with image processing tools (Claude Code, Cursor, etc.)
- WooCommerce add-on (optional - for product image optimization)
- Read access to scan images, write access to upload optimized versions

## How to Use

### Trigger Phrase
"optimize my wordpress images with ai"

### Alternative Triggers
- "run ai image optimization"
- "compress and optimize all images"
- "audit my media library"
- "improve image performance"

### What Happens

**Phase 1: Comprehensive Image Audit**

1. Scans all images across site:
   - Media library (all uploaded files)
   - Content images (posts, pages, custom post types)
   - Featured images
   - Builder images (Elementor, Divi, Bricks, etc.)
   - WooCommerce product images (if WooCommerce active)
2. Analyzes each image:
   - File size and format
   - Actual dimensions vs displayed dimensions
   - Alt text presence and quality
   - Filename SEO-friendliness
   - Usage (which pages/posts use this image)
   - Responsive image sizes (srcset)
   - Lazy loading implementation
3. Detects optimization plugins/CDN:
   - Smush, ShortPixel, EWWW, Imagify, Optimole
   - Cloudflare, BunnyCDN, other CDNs
4. Scores opportunities by impact:
   - File size x page traffic = optimization priority
   - Separates quick wins from big wins
5. Generates comprehensive report

**Phase 2: User Approval**

Presents report and asks which optimizations to run:
- Compress oversized images
- Convert JPG/PNG -> WebP
- Resize unnecessarily large originals
- Rename non-SEO filenames
- Add missing alt text
- Regenerate responsive image sizes

User can choose:
- "Optimize everything" (all optimizations)
- "Compress only" (no format changes)
- "Top 10 images" (highest impact first)
- "Homepage images only" (critical pages first)

**Phase 3: AI Processing**

6. Downloads images from WordPress to local workspace.
7. Processes images locally:
   - Compression
   - Format conversion
   - Resizing
   - SEO-friendly renaming
   - AI alt text generation
8. Uploads optimized versions back to WordPress:
   - Creates NEW media entries (original files untouched)
   - Sets metadata (alt text, dimensions, etc.)
   - Marks old files as "deprecated - replaced by [new-filename]"
9. Updates content references in duplicates:
   - Creates duplicates of affected posts/pages
   - Replaces old image URLs with new optimized URLs
   - Updates builder and WooCommerce image references
10. Regenerates responsive image sizes and srcset support

**Phase 4: Review & Publish**

11. Provides before/after comparison:
   - File size savings
   - Format changes
   - Dimension changes
   - Filename improvements
   - Pages affected
12. User reviews duplicates in WordPress admin
13. User approves publishing
14. Old files remain available for safety and rollback

## Honest Disclaimer

This skill downloads images, processes them with AI, and uploads optimized versions. You review all changes before publishing.

**What this skill CANNOT do:**
- Guarantee perfect quality (compression is lossy)
- Fix already broken/corrupted image files
- Optimize CSS background images
- Process images hosted externally outside WordPress uploads
- Improve composition/art direction (technical optimization only)

**What this skill CAN do:**
- Compress images without visible quality loss
- Convert to WebP for significant size reduction
- Resize oversized originals to practical dimensions
- Rename files with SEO-friendly names
- Generate descriptive alt text
- Update references automatically in duplicates
- Preserve originals for safety and rollback

## Safety Model

- Non-destructive: Creates NEW optimized images and keeps old files
- Duplicate-first: Updates content in duplicates, never live pages
- User approval required: Review before publishing
- Rollback ready: Old files preserved and reversible
- No live site impact until explicit approval

## Technical Details

Uses these Respira MCP tools:

**Media Operations:**
- `wordpress_list_media`
- `wordpress_get_media`
- `wordpress_upload_media`
- `wordpress_update_media`
- `wordpress_delete_media` (optional cleanup)

**Content Scanning:**
- `wordpress_list_pages`
- `wordpress_list_posts`
- `wordpress_get_page`
- `wordpress_get_post`
- `wordpress_detect_page_builder`

**Content Updates:**
- `wordpress_create_duplicate`
- `wordpress_update_page`
- `wordpress_update_post`

**WooCommerce (optional):**
- `woocommerce_list_products`
- `woocommerce_get_product`
- `woocommerce_update_product`

**Plugin Detection:**
- `wordpress_list_plugins`

## Related Skills

- SEO & AEO Amplifier
- WordPress Site DNA
- Mobile Experience Report

---

Built by Respira Team
https://respira.press/skills/wordpress-ai-image-optimizer
