# SEO Assets Required

This directory should contain the following image assets for proper SEO implementation:

## Required Files

### Favicon Files
- `favicon.ico` - 32x32 or 16x16 icon file (currently placeholder text file)
  - Replace with actual .ico file

### Open Graph Image
- `og-image.png` - 1200x630 PNG for social media sharing
  - Used for Facebook, LinkedIn, Twitter cards
  - Should contain brand logo and tagline
  - Recommended: Clear, high-contrast design
  - Currently placeholder text file - replace with actual PNG

### Logo
- `logo.png` - Company logo for structured data
  - Recommended: Square format, at least 512x512
  - Used in JSON-LD organization schema
  - Currently placeholder text file - replace with actual PNG

## Current Status
All files are currently TEXT PLACEHOLDERS. You must replace them with actual image files:

1. **favicon.ico** - Create a 32x32 or 16x16 .ico file
2. **og-image.png** - Create a 1200x630 PNG image
3. **logo.png** - Create a 512x512 square PNG logo

## How to Add Real Images

### Option 1: Use existing assets
If you have existing brand assets, simply replace the placeholder files:
```bash
cp /path/to/your/favicon.ico public/favicon.ico
cp /path/to/your/og-image.png public/og-image.png
cp /path/to/your/logo.png public/logo.png
```

### Option 2: Create new assets
Use design tools like Figma, Photoshop, or online generators:
- **Favicon**: Use https://favicon.io or similar
- **OG Image**: Design at 1200x630px with your brand
- **Logo**: Export square version of your logo

### Option 3: Next.js Metadata Files (Advanced)
For automatic icon generation, you can use Next.js special files:
- `src/app/icon.png` or `src/app/icon.svg` - Auto-generates multiple sizes
- `src/app/apple-icon.png` - Apple touch icon
- `src/app/opengraph-image.png` - OG image (can be per-route)

These must be actual image files, not text placeholders.

## Why Placeholders?
The placeholder text files are included so the SEO system is fully configured and ready. Once you add real images, the entire SEO system will work immediately without any code changes.

## Testing
After adding real images:
1. Clear Next.js cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Test social sharing with Facebook Debugger or Twitter Card Validator
4. Verify favicon appears in browser tabs
