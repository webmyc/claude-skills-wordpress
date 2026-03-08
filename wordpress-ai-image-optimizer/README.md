# WordPress AI Image Optimizer

> AI-powered image optimization that processes images locally and updates your WordPress references safely.

## Overview

WordPress AI Image Optimizer scans your entire site image footprint, identifies high-impact optimization opportunities, processes images locally in an AI coding environment (compression, conversion, resize, rename), uploads optimized versions as new media entries, and updates references in duplicate content for review.

## Key Capabilities

- Sitewide image auditing (media library, posts/pages, featured images, builder content, WooCommerce)
- Compression and format conversion (JPG/PNG to WebP where appropriate)
- Oversize detection and resizing to practical dimensions
- SEO-friendly filename generation
- AI-assisted alt text generation
- Duplicate-first URL updates with safe rollback path
- Plugin and CDN awareness (Smush, ShortPixel, EWWW, Imagify, Optimole, Cloudflare, BunnyCDN)

## Safety Model

- Creates new optimized files and keeps originals
- Applies URL updates in duplicates, not live content
- Requires explicit review and approval before publish
- Supports rollback by preserving original media references

## Trigger

Use:

```text
optimize my wordpress images with ai
```

## Output

- Image health score
- Prioritized optimization list (critical/high/medium/low)
- Before/after size and format comparisons
- Estimated performance impact summary
- Review-ready duplicate content references

## Source

- Skill folder: [wordpress-ai-image-optimizer](https://github.com/webmyc/claude-skills-wordpress/tree/main/wordpress-ai-image-optimizer)
- Live page: https://respira.press/skills/wordpress-ai-image-optimizer

---

Built by Respira Team
