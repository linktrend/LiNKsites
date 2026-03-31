# Layout Blocks Guide for CMS Admins

## Introduction

All page types in the CMS now use a unified **Layout Blocks** system. This allows you to build flexible, custom page layouts by combining different content blocks.

## How to Use Layout Blocks

1. Open any page in the CMS (Pages, Offers, Cases, Articles, FAQ, Legal, Videos)
2. Find the **Layout** field
3. Click **Add Block** to add a new content section
4. Choose a block type from the dropdown
5. Fill in the block-specific fields
6. Reorder blocks by dragging them
7. Save your page

## Available Block Types

### 🎯 Hero Block
**Purpose:** Main page header with call-to-action

**When to use:** First block on most pages, especially landing pages

**Fields:**
- Heading (required) - Main title
- Subheading - Secondary text
- Body - Additional description
- Badge - Small label (e.g., "New", "Featured")
- CTA Label - Button text
- CTA URL - Button link
- Background Image - Hero background
- Media - Featured image/video
- Social Proof - Testimonials or media mentions

**Example:** Homepage hero, Product launch announcement

---

### ⭐ Features Block
**Purpose:** Showcase features or benefits in a grid

**When to use:** Highlighting product features, service offerings, key benefits

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Items (array):
  - Icon - Icon identifier
  - Title (required)
  - Description (required)
  - Link Text - Optional link
  - Link URL - Link destination

**Example:** "Why Choose Us", "Key Features", "What We Offer"

---

### 💰 Pricing Block
**Purpose:** Display pricing plans and tiers

**When to use:** Pricing pages, product pages with pricing

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Monthly Label - Label for monthly billing
- Yearly Label - Label for yearly billing
- Plans (array):
  - Name (required)
  - Description
  - Monthly Price
  - Yearly Price
  - CTA Text
  - Features Label
  - Features (array)
  - Popular - Mark as featured plan

**Example:** Product pricing, Service tiers, Subscription plans

---

### 💬 Testimonials Block
**Purpose:** Display customer testimonials

**When to use:** Social proof sections, case study pages

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Testimonials (array):
  - Quote (required)
  - Author (required)
  - Role
  - Avatar - Author photo

**Example:** "What Our Customers Say", "Success Stories"

---

### 🎯 CTA Block
**Purpose:** Call-to-action section to drive conversions

**When to use:** End of pages, between sections, conversion points

**Fields:**
- Title (required) - Main message
- Body - Supporting text
- CTA Label (required) - Button text
- CTA URL (required) - Button link
- Trust Indicators (array) - Trust signals (e.g., "No credit card required")

**Example:** "Get Started Today", "Book a Demo", "Try Free"

---

### ❓ FAQ Block
**Purpose:** Frequently asked questions accordion

**When to use:** FAQ pages, product pages, support content

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Items (array):
  - Question (required)
  - Answer (required)
  - Category - For filtering

**Example:** Product FAQs, General FAQs, Support questions

---

### 📝 Rich Text Block
**Purpose:** Rich formatted content (headings, lists, links, etc.)

**When to use:** Article body, long-form content, formatted text

**Fields:**
- Content (required) - Rich text editor

**Example:** Blog post content, Article body, Documentation

---

### 📄 Content Block
**Purpose:** Same as Rich Text (alternative name)

**When to use:** General content sections

**Fields:**
- Content (required) - Rich text editor

---

### 🖼️ Media Block
**Purpose:** Display images or videos

**When to use:** Visual content, galleries, featured media

**Fields:**
- Media (required) - Upload or select media
- Caption - Image caption
- Alt Text - Accessibility description

**Example:** Featured images, Screenshots, Product photos

---

### 📰 Articles Block
**Purpose:** Display a grid of related articles

**When to use:** Resource pages, related content sections

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Articles - Select articles to display (relationship)

**Example:** "Related Articles", "Latest Posts", "Recommended Reading"

---

### 📊 Case Studies Block
**Purpose:** Display a grid of case studies

**When to use:** Success stories section, related cases

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Case Studies - Select case studies (relationship)

**Example:** "Customer Success Stories", "See Results"

---

### 🎁 Offer Showcase Block
**Purpose:** Display product/service offerings

**When to use:** Product showcase, services overview

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Offers - Select offers to display (relationship)

**Example:** "Our Products", "Services We Offer"

---

### 📧 Newsletter Block
**Purpose:** Newsletter signup form

**When to use:** End of articles, footer areas, engagement points

**Fields:**
- Title - Section heading
- Subtitle - Section description
- Placeholder - Email input placeholder
- Button Text - Submit button text

**Example:** "Subscribe to Our Newsletter", "Stay Updated"

---

## Best Practices

### Page Structure
1. **Start with Hero** - Most pages should begin with a Hero block
2. **Content Flow** - Arrange blocks in logical order (problem → solution → benefits → pricing → CTA)
3. **Visual Breaks** - Alternate between content-heavy and visual blocks
4. **End with CTA** - Always include a call-to-action at the end

### Block Combinations

**Landing Page:**
```
Hero → Features → Testimonials → Pricing → CTA → Newsletter
```

**Product Page:**
```
Hero → Features → Case Studies → Pricing → FAQ → CTA
```

**Article Page:**
```
Hero → Rich Text → Media → Articles (related) → Newsletter
```

**About Page:**
```
Hero → Rich Text → Features → Testimonials → CTA
```

### Tips
- **Keep it scannable** - Use clear headings and short paragraphs
- **Visual hierarchy** - Most important content first
- **Mobile-first** - All blocks are responsive by default
- **Test your layout** - Preview pages before publishing
- **Consistency** - Use similar patterns across similar page types

## Migration from Old System

If you have existing pages with the old system:

1. **Pages Collection:** Old `sections[]` → New `layout[]` blocks
2. **Offers/Cases/Articles:** Old `body_content` → New Rich Text block in `layout[]`
3. **FAQ:** Old individual items → New FAQ pages with FAQ blocks

Contact your developer if you need help migrating existing content.

## Need Help?

- Check the block preview in the CMS admin
- Refer to existing pages for examples
- Contact your technical team for custom block types
- See MIGRATION_GUIDE.md for technical details
