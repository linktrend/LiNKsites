# Media Assets Upload List - Wave 4

This document lists all placeholder images referenced in the seed script that need to be uploaded to the CMS media library.

## Overview
The seed script has been updated with real content from the About and Pricing pages. However, image references are currently using placeholder paths. These need to be replaced with actual media uploads in Wave 4.

## Placeholder Images Referenced

### About Page
- **Hero Background Image**: `/placeholders/about-hero-bg.jpg`
  - Location: About page hero block
  - Purpose: Background image for "Building the Future of AI-Powered Automation" hero section
  - Recommended size: 1920x1080px or larger
  - Format: JPG or WebP

### Pricing Page
- **Hero Background Image**: `/placeholders/pricing-hero-bg.jpg`
  - Location: Pricing page hero block
  - Purpose: Background image for "Flexible Pricing for Every Business" hero section
  - Recommended size: 1920x1080px or larger
  - Format: JPG or WebP

### Product Ecosystem (Not Implemented)
The About page originally had a product carousel with 8 product logos:
- Product 1 through Product 8 logos
- **Status**: Skipped - requires custom carousel block implementation
- **Wave 4 Task**: Create custom ProductCarousel block and add product logos

## Icons Referenced

The following icon names are used in the seed script (from lucide-react library):
- **Target** - Mission icon
- **Eye** - Vision icon
- **Lightbulb** - Innovation First value
- **Users** - Customer Obsession value
- **Shield** - Trust & Transparency value
- **TrendingUp** - Continuous Growth value

**Note**: These are icon component names, not image files. They should render automatically via the frontend icon component.

## Wave 4 Implementation Steps

### 1. Upload Images to CMS
1. Navigate to CMS Admin → Media
2. Upload the following images:
   - About hero background image
   - Pricing hero background image
3. Note the media IDs for each uploaded image

### 2. Update Seed Script References
Replace placeholder paths with media IDs:

```typescript
// Before
{
  blockType: 'hero',
  title: 'Building the Future of AI-Powered Automation',
  // No backgroundImage field currently
}

// After
{
  blockType: 'hero',
  title: 'Building the Future of AI-Powered Automation',
  backgroundImage: '<MEDIA_ID_FROM_CMS>', // Add media ID
}
```

### 3. Implement Product Carousel (Optional)
If product showcase is needed:
1. Create `ProductCarouselBlock.ts` in `/src/blocks/`
2. Add schema for product items with logo uploads
3. Update About page seed data to include carousel block
4. Upload 8 product logos to media library

## Current Status

✅ **Completed**:
- Seed script updated with real content from EXTRACTED_CONTENT.md
- About page: 5 blocks (hero, richText, 2x features, cta)
- Pricing page: 10 blocks (hero, 4x offer sections with titles and plans, cta)
- All 12 pricing plans with 85+ features mapped correctly
- Icon names specified for all feature items

⏳ **Pending (Wave 4)**:
- Upload actual hero background images
- Update seed script with media IDs
- Implement product carousel block (optional)
- Test frontend rendering with real images

## Notes

### Image Sources
The original website template should have the following images available:
- Check `/public/` directory in the website-master-template
- Look for hero/banner images in the About and Pricing sections
- Product logos may be in `/public/products/` or similar

### Alternative Approach
Instead of updating the seed script, you could:
1. Upload images via CMS admin
2. Manually edit the About and Pricing pages in CMS
3. Add background images through the admin UI
4. This avoids re-running the seed script

### Recommended Image Specifications
- **Format**: WebP (best compression) or JPG
- **Hero backgrounds**: 1920x1080px minimum, 2560x1440px recommended
- **Product logos**: 200x200px or SVG format
- **Optimization**: Use image compression tools before upload
- **Alt text**: Add descriptive alt text for accessibility

## Summary

**Total placeholder images**: 2
- About hero background
- Pricing hero background

**Total icons (no upload needed)**: 6
- All icons use lucide-react component names

**Optional additions**: 8 product logos for carousel (requires custom block)
