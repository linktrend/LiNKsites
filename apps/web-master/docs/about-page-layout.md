# About Page Layout Specification

## Visual Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER (Global)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 1: HERO                                            │
│  ┌────────────────────────┬─────────────────────────────┐   │
│  │  Left Column           │  Right Column               │   │
│  │  - Static branding     │  - Hero Title               │   │
│  │  - "About LinkTrend"   │  - Hero Subtitle/Slogan     │   │
│  │                        │  (White card overlay)       │   │
│  └────────────────────────┴─────────────────────────────┘   │
│  Background: Full-width hero image with gradient overlay    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 2: INFINITE PRODUCT CAROUSEL                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "Our Product Ecosystem"                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ◄─── [Logo] [Logo] [Logo] [Logo] [Logo] ───►      │   │
│  │       Continuous auto-scroll, infinite loop         │   │
│  │       Grayscale logos, hover to show color          │   │
│  └─────────────────────────────────────────────────────┘   │
│  Background: Light muted                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 3: PRODUCTS & SERVICES                             │
│  ┌────────────────────────┬─────────────────────────────┐   │
│  │  Left Column           │  Right Column               │   │
│  │  - Title               │  - Feature Image            │   │
│  │  - Description         │  (Placeholder)              │   │
│  │  (Text content)        │                             │   │
│  └────────────────────────┴─────────────────────────────┘   │
│  Background: White                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 4: VALUES                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TOP: Mission & Vision                              │   │
│  │  ┌─────────────────────┬─────────────────────────┐  │   │
│  │  │  Mission Card       │  Vision Card            │  │   │
│  │  │  - Title            │  - Title                │  │   │
│  │  │  - Description      │  - Description          │  │   │
│  │  └─────────────────────┴─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BOTTOM: Core Values (2x2 Grid)                     │   │
│  │  ┌──────────────────┬──────────────────┐            │   │
│  │  │  Value Card 1    │  Value Card 2    │            │   │
│  │  │  [Icon] Title    │  [Icon] Title    │            │   │
│  │  │  Description     │  Description     │            │   │
│  │  └──────────────────┴──────────────────┘            │   │
│  │  ┌──────────────────┬──────────────────┐            │   │
│  │  │  Value Card 3    │  Value Card 4    │            │   │
│  │  │  [Icon] Title    │  [Icon] Title    │            │   │
│  │  │  Description     │  Description     │            │   │
│  │  └──────────────────┴──────────────────┘            │   │
│  └─────────────────────────────────────────────────────┘   │
│  Background: Light muted                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 5: CTA                                             │
│  ┌────────────────────────┬─────────────────────────────┐   │
│  │  Left Column           │  Right Column               │   │
│  │  - Title               │  - CTA Card                 │   │
│  │  - Why contact us      │    - Title                  │   │
│  │  (Persuasive text)     │    - Subtitle               │   │
│  │                        │    - [CTA Button]           │   │
│  │                        │      "Let's Work Together"  │   │
│  └────────────────────────┴─────────────────────────────┘   │
│  Background: Gradient (primary/rose)                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FOOTER (Global)                          │
└─────────────────────────────────────────────────────────────┘
```

## Section Details

### 1. Hero Section
- **Height:** 600px minimum
- **Layout:** 2-column grid (50/50 on desktop, stacked on mobile)
- **Background:** Full-width image with dark gradient overlay
- **Right Column:** White card with rounded corners, shadow, backdrop blur

### 2. Product Carousel
- **Height:** Auto (based on logo height + padding)
- **Animation:** Continuous left scroll, 30s duration
- **Logos:** 8+ logos, grayscale by default, color on hover
- **Behavior:** Infinite loop (duplicated set), pause on hover

### 3. Products & Services
- **Layout:** 2-column grid (50/50 on desktop, stacked on mobile)
- **Left:** Text content with title and description
- **Right:** Image (400px height, rounded corners, shadow)

### 4. Values Section
- **Top Sub-section:** 2-column grid (Mission | Vision)
- **Bottom Sub-section:** 2x2 grid (4 value cards)
- **Cards:** White background, border, shadow, hover effects
- **Icons:** Lucide icons, 24px, primary color

### 5. CTA Section
- **Layout:** 2-column grid (60/40 on desktop, stacked on mobile)
- **Container:** Gradient background, rounded corners, border
- **Right Column:** White card with centered content
- **Button:** Full-width, rose-500 background

## Responsive Breakpoints

- **Mobile:** < 768px - All columns stack vertically
- **Tablet:** 768px - 1024px - 2-column layouts maintained
- **Desktop:** > 1024px - Full multi-column layouts

## Color Scheme

- **Primary:** Default theme primary color
- **Accent:** Rose-500 (#f43f5e)
- **Background:** White / Muted (#f9fafb)
- **Text:** Foreground / Muted-foreground
- **Borders:** Border color with subtle opacity

## Typography

- **Hero Title:** 3xl-5xl, bold
- **Section Titles:** 3xl-4xl, bold
- **Card Titles:** xl-2xl, semibold
- **Body Text:** base-lg, regular
- **Muted Text:** Muted-foreground color

## Spacing

- **Section Padding:** py-16 to py-24 (64px-96px)
- **Container Padding:** px-4 to px-6
- **Card Padding:** p-8 (32px)
- **Grid Gaps:** gap-8 to gap-12 (32px-48px)

## Interactive Elements

1. **Product Carousel:**
   - Auto-scroll animation
   - Pause on hover
   - Grayscale to color transition

2. **Value Cards:**
   - Hover effect: border color change, shadow increase
   - Smooth transitions (300ms)

3. **CTA Button:**
   - Hover: darker background
   - Opens external link in new tab
   - Full-width on mobile

## CMS Integration Points

All content is CMS-driven with clear data attributes:
- `data-cms-section` - Main sections
- `data-cms-element` - Sub-sections
- `data-cms-field` - Individual fields
- `data-cms-collection` - Repeatable items

See `about-cms-mapping.md` for complete field mapping.






