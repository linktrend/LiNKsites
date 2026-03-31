# Home Page Structure - Visual Overview

This document provides a visual representation of the home page structure with all CMS-editable elements labeled.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECTION 1: HERO                          │
│                     [Dynamic Background Image]                  │
│                     CMS: hero.backgroundImage                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────┐  ┌────────────────────────┐ │
│  │   SOCIAL PROOF CAROUSEL       │  │   SIGNUP FORM          │ │
│  │   CMS: hero.socialProof[]     │  │   CMS: hero.signupForm │ │
│  │                               │  │                        │ │
│  │  ┌─────────────────────────┐  │  │  ┌──────────────────┐ │ │
│  │  │ [Testimonial/Media]     │  │  │  │ Title            │ │ │
│  │  │ • Quote                 │  │  │  │ Subtitle         │ │ │
│  │  │ • Author / Publication  │  │  │  ├──────────────────┤ │ │
│  │  └─────────────────────────┘  │  │  │ OAuth Buttons    │ │ │
│  │                               │  │  │ [G] [A] [M]      │ │ │
│  │  Navigation Dots: ● ○ ○ ○     │  │  ├──────────────────┤ │ │
│  └───────────────────────────────┘  │  │ OR               │ │ │
│                                      │  ├──────────────────┤ │ │
│                                      │  │ Email Field      │ │ │
│                                      │  │ Phone Field      │ │ │
│                                      │  ├──────────────────┤ │ │
│                                      │  │ ☑ Terms Checkbox │ │ │
│                                      │  ├──────────────────┤ │ │
│                                      │  │ [Get Started]    │ │ │
│                                      │  └──────────────────┘ │ │
│                                      └────────────────────────┘ │
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │  SCROLL INDICATOR   │                      │
│                    │  "Explore more" ↓   │                      │
│                    │  CMS: hero.scroll   │                      │
│                    └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              SECTION 2: PLATFORM & PRICING                      │
│              CMS: platformPricing                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────┐  ┌─────────────────────┐   │
│  │   PLATFORM FEATURES            │  │  PRICING PREVIEW    │   │
│  │   CMS: platformPricing.        │  │  CMS: platformPricing│  │
│  │        features                │  │       .pricing       │   │
│  │                                │  │                     │   │
│  │  Title: "Platform built..."    │  │  Title: "Simple..." │   │
│  │  Subtitle: "Everything..."     │  │  Subtitle: "Choose" │   │
│  │                                │  │                     │   │
│  │  ┌──────────┐  ┌──────────┐   │  │  [Yearly|Monthly]   │   │
│  │  │ [Icon]   │  │ [Icon]   │   │  │                     │   │
│  │  │ Title    │  │ Title    │   │  │  ┌───────────────┐  │   │
│  │  │ Desc     │  │ Desc     │   │  │  │ Free          │  │   │
│  │  │ Link →   │  │ Link →   │   │  │  │ $0            │  │   │
│  │  └──────────┘  └──────────┘   │  │  │ [Talk to us]  │  │   │
│  │                                │  │  │ • Features    │  │   │
│  │  ┌──────────┐  ┌──────────┐   │  │  └───────────────┘  │   │
│  │  │ [Icon]   │  │ [Icon]   │   │  │  ┌───────────────┐  │   │
│  │  │ Title    │  │ Title    │   │  │  │ Pro ⭐        │  │   │
│  │  │ Desc     │  │ Desc     │   │  │  │ $29/mo        │  │   │
│  │  │ Link →   │  │ Link →   │   │  │  │ [Talk to us]  │  │   │
│  │  └──────────┘  └──────────┘   │  │  │ • Features    │  │   │
│  │                                │  │  └───────────────┘  │   │
│  │  CMS: features.cards[]         │  │  ┌───────────────┐  │   │
│  │  (4 cards)                     │  │  │ Enterprise    │  │   │
│  └────────────────────────────────┘  │  │ Custom        │  │   │
│                                      │  │ [Talk to us]  │  │   │
│                                      │  │ • Features    │  │   │
│                                      │  └───────────────┘  │   │
│                                      │                     │   │
│                                      │  [↑] Scroll [↓]     │   │
│                                      │  "View detailed..." │   │
│                                      │                     │   │
│                                      │  CMS: pricing.tiers[]│  │
│                                      │  (3 tiers)          │   │
│                                      └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              SECTION 3: CTA & SOLUTIONS                         │
│              CMS: ctaSolutions                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │   CTA SECTION        │  │   SOLUTIONS OVERVIEW         │    │
│  │   CMS: ctaSolutions  │  │   CMS: ctaSolutions.         │    │
│  │        .cta          │  │        solutions             │    │
│  │                      │  │                              │    │
│  │  Title: "Ready..."   │  │  Title: "Solutions for..."   │    │
│  │  Description: "Join" │  │  Subtitle: "Discover how..." │    │
│  │                      │  │                              │    │
│  │  ┌────────────────┐  │  │  ┌──────────┐  ┌──────────┐ │    │
│  │  │ [Get started]  │  │  │  │ [Icon]   │  │ [Icon]   │ │    │
│  │  └────────────────┘  │  │  │ Title    │  │ Title    │ │    │
│  │                      │  │  │ Desc     │  │ Desc     │ │    │
│  │  Trust Indicators:   │  │  │ Explore→ │  │ Explore→ │ │    │
│  │  ✓ No credit card    │  │  └──────────┘  └──────────┘ │    │
│  │  ✓ Free templates    │  │                              │    │
│  │  ✓ Cancel anytime    │  │  ┌──────────┐  ┌──────────┐ │    │
│  │                      │  │  │ [Icon]   │  │ [Icon]   │ │    │
│  │  CMS: cta.trust      │  │  │ Title    │  │ Title    │ │    │
│  │       Indicators[]   │  │  │ Desc     │  │ Desc     │ │    │
│  └──────────────────────┘  │  │ Explore→ │  │ Explore→ │ │    │
│                             │  └──────────┘  └──────────┘ │    │
│                             │                              │    │
│                             │  CMS: solutions.cards[]      │    │
│                             │  (4 cards)                   │    │
│                             └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## CMS Field Hierarchy

### 📄 homePage
```
homePage
├── hero
│   ├── backgroundImage (Image URL)
│   ├── socialProof[] (Collection)
│   │   ├── [0] Testimonial/Media Item
│   │   │   ├── id
│   │   │   ├── type ("testimonial" | "media")
│   │   │   ├── quote
│   │   │   ├── author (if testimonial)
│   │   │   ├── title (if testimonial)
│   │   │   └── publication (if media)
│   │   ├── [1] ...
│   │   └── [n] ...
│   ├── signupForm
│   │   ├── title
│   │   ├── subtitle
│   │   ├── oauthProviders[] (Array of strings)
│   │   ├── dividerText
│   │   ├── emailLabel
│   │   ├── emailPlaceholder
│   │   ├── phoneLabel
│   │   ├── phonePlaceholder
│   │   ├── termsTextBefore
│   │   ├── privacyLinkText
│   │   ├── privacyLinkUrl
│   │   ├── termsTextMiddle
│   │   ├── termsLinkText
│   │   ├── termsLinkUrl
│   │   ├── submitButtonText
│   │   └── submitButtonUrl
│   └── scrollIndicator
│       ├── text
│       └── targetId
│
├── platformPricing
│   ├── features
│   │   ├── title
│   │   ├── subtitle
│   │   └── cards[] (Collection)
│   │       ├── [0] Feature Card
│   │       │   ├── id
│   │       │   ├── icon
│   │       │   ├── title
│   │       │   ├── description
│   │       │   ├── linkText
│   │       │   └── linkUrl
│   │       ├── [1] ...
│   │       └── [3] (4 cards total)
│   └── pricing
│       ├── title
│       ├── subtitle
│       ├── monthlyLabel
│       ├── yearlyLabel
│       ├── defaultBilling
│       ├── scrollLabel
│       ├── footerLinkText
│       ├── footerLinkUrl
│       └── tiers[] (Collection)
│           ├── [0] Pricing Tier
│           │   ├── id
│           │   ├── name
│           │   ├── description
│           │   ├── monthlyPrice
│           │   ├── yearlyPrice
│           │   ├── buttonText
│           │   ├── buttonUrl
│           │   ├── highlighted
│           │   └── features[] (Array of strings)
│           ├── [1] ...
│           └── [2] (3 tiers total)
│
└── ctaSolutions
    ├── cta
    │   ├── title
    │   ├── description
    │   ├── buttonText
    │   ├── buttonUrl
    │   └── trustIndicators[] (Array of strings)
    └── solutions
        ├── title
        ├── subtitle
        └── cards[] (Collection)
            ├── [0] Solution Card
            │   ├── id
            │   ├── icon
            │   ├── title
            │   ├── description
            │   ├── linkText
            │   └── linkUrl
            ├── [1] ...
            └── [3] (4 cards total)
```

---

## Element Count Summary

| Section | Element Type | Count | CMS Path |
|---------|-------------|-------|----------|
| **Hero Section** | | | |
| Background | Image | 1 | `hero.backgroundImage` |
| Social Proof Items | Carousel Items | 4 (recommended) | `hero.socialProof[]` |
| OAuth Providers | Buttons | 3 | `hero.signupForm.oauthProviders[]` |
| Form Fields | Input Fields | 2 | `hero.signupForm.*` |
| Legal Links | Links | 2 | `hero.signupForm.*LinkUrl` |
| **Platform & Pricing** | | | |
| Feature Cards | Cards | 4 | `platformPricing.features.cards[]` |
| Pricing Tiers | Cards | 3 | `platformPricing.pricing.tiers[]` |
| **CTA & Solutions** | | | |
| Trust Indicators | List Items | 3 | `ctaSolutions.cta.trustIndicators[]` |
| Solution Cards | Cards | 4 | `ctaSolutions.solutions.cards[]` |
| **TOTAL EDITABLE ELEMENTS** | | **~100+** | |

---

## Component Breakdown

### 1. DynamicBgSection
**File:** `src/components/marketing/DynamicBgSection.tsx`

**CMS Fields:**
- Background image URL

**Current Implementation:** Random Picsum image
**Recommended Change:** Load from CMS

---

### 2. SocialProofCarousel
**File:** `src/components/marketing/SocialProofCarousel.tsx`

**CMS Fields:**
- Collection of testimonials/media mentions
- Each item: type, quote, author, title, publication

**Current Implementation:** Hardcoded array
**Recommended Change:** Load from CMS, maintain auto-rotation logic

---

### 3. SignupHero
**File:** `src/components/marketing/SignupHero.tsx`

**CMS Fields:**
- Title, subtitle
- OAuth providers array
- Divider text
- Field labels and placeholders
- Terms text and links
- Submit button text and URL

**Current Implementation:** Hardcoded strings
**Recommended Change:** Load all text from CMS, keep form logic

---

### 4. ScrollIndicator
**File:** `src/components/marketing/ScrollIndicator.tsx`

**CMS Fields:**
- Text label
- Target section ID

**Current Implementation:** Hardcoded text and target
**Recommended Change:** Load from CMS

---

### 5. PlatformFeatures
**File:** `src/components/marketing/PlatformFeatures.tsx`

**CMS Fields:**
- Section title and subtitle
- Collection of feature cards (4 items)
- Each card: icon, title, description, link text, link URL

**Current Implementation:** Hardcoded array
**Recommended Change:** Load from CMS, maintain grid layout

---

### 6. PricingPreview
**File:** `src/components/marketing/PricingPreview.tsx`

**CMS Fields:**
- Section title and subtitle
- Billing labels (monthly/yearly)
- Default billing selection
- Collection of pricing tiers (3 items)
- Each tier: name, description, prices, button, features
- Scroll label
- Footer link text and URL

**Current Implementation:** Hardcoded array
**Recommended Change:** Load from CMS, keep toggle and scroll logic

---

### 7. CTASection
**File:** `src/components/marketing/CTASection.tsx`

**CMS Fields:**
- Title and description
- Button text and URL
- Trust indicators array

**Current Implementation:** Hardcoded array
**Recommended Change:** Load from CMS

---

### 8. SolutionsOverview
**File:** `src/components/marketing/SolutionsOverview.tsx`

**CMS Fields:**
- Section title and subtitle
- Collection of solution cards (4 items)
- Each card: icon, title, description, link text, link URL

**Current Implementation:** Hardcoded array
**Recommended Change:** Load from CMS, maintain grid layout

---

## Data Attributes Reference

### Section-Level Attributes
```html
data-cms-section="hero"
data-cms-section="platformPricing"
data-cms-section="ctaSolutions"
```

### Sub-Section Attributes
```html
data-cms-element="hero.socialProof"
data-cms-element="hero.signupForm"
data-cms-element="platformPricing.features"
data-cms-element="platformPricing.pricing"
data-cms-element="ctaSolutions.cta"
data-cms-element="ctaSolutions.solutions"
```

### Collection Attributes
```html
data-cms-collection="hero.socialProof"
data-cms-collection="platformPricing.features.cards"
data-cms-collection="platformPricing.pricing.tiers"
data-cms-collection="ctaSolutions.solutions.cards"
```

### Item Attributes
```html
data-cms-item="hero.socialProof[0]"
data-cms-item="platformPricing.features.cards[1]"
data-cms-item="platformPricing.pricing.tiers[2]"
```

### Field Attributes
```html
data-cms-field="hero.signupForm.title"
data-cms-field="platformPricing.features.title"
data-cms-field="ctaSolutions.cta.buttonText"
```

---

## Icon Reference

### Available Icons (Lucide React)

**Platform Features:**
- `Zap` - Lightning/Speed
- `TrendingUp` - Growth/Analytics
- `Sparkles` - AI/Magic
- `HeadphonesIcon` - Support/Service
- `Shield` - Security
- `Users` - Team/Collaboration
- `Settings` - Configuration
- `Database` - Data/Storage

**Solutions:**
- `Users` - Team/People
- `Building2` - Company/Industry
- `TrendingUp` - Growth/Scale
- `UserCheck` - Role/Permission
- `Briefcase` - Business
- `Target` - Goals/Objectives

**Other:**
- `Quote` - Testimonial quote icon
- `Check` - Checkmark for lists
- `ChevronDown` - Scroll indicator
- `ChevronUp` / `ChevronDown` - Scroll controls
- `ArrowRight` - Link arrows

---

## Quick Reference: Where to Find Content

| Content Type | Location | CMS Path |
|--------------|----------|----------|
| Hero background | Hero section | `hero.backgroundImage` |
| Testimonials | Carousel | `hero.socialProof[]` |
| Signup form text | Hero section | `hero.signupForm.*` |
| Feature cards | Section 2 left | `platformPricing.features.cards[]` |
| Pricing tiers | Section 2 right | `platformPricing.pricing.tiers[]` |
| CTA content | Section 3 left | `ctaSolutions.cta.*` |
| Solution cards | Section 3 right | `ctaSolutions.solutions.cards[]` |

---

## Mobile vs Desktop Layout

### Mobile (< 640px)
```
┌─────────────────┐
│  SIGNUP FORM    │
├─────────────────┤
│  CAROUSEL       │
├─────────────────┤
│  SCROLL ↓       │
└─────────────────┘

┌─────────────────┐
│  FEATURE 1      │
├─────────────────┤
│  FEATURE 2      │
├─────────────────┤
│  FEATURE 3      │
├─────────────────┤
│  FEATURE 4      │
├─────────────────┤
│  PRICING        │
└─────────────────┘

┌─────────────────┐
│  SOLUTION 1     │
├─────────────────┤
│  SOLUTION 2     │
├─────────────────┤
│  SOLUTION 3     │
├─────────────────┤
│  SOLUTION 4     │
├─────────────────┤
│  CTA            │
└─────────────────┘
```

### Desktop (> 1024px)
```
┌─────────────────────────────────────┐
│  CAROUSEL       │  SIGNUP FORM      │
│                 │                   │
│  SCROLL ↓       │                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  FEATURE 1  │ FEATURE 2  │ PRICING │
│  FEATURE 3  │ FEATURE 4  │         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  CTA        │ SOLUTION 1 │ SOLUTION 2│
│             │ SOLUTION 3 │ SOLUTION 4│
└─────────────────────────────────────┘
```

---

## Next Steps for CMS Integration

1. **Create CMS Schema**
   - Define content types matching the structure above
   - Set up field validations and character limits
   - Configure image upload settings

2. **Update Components**
   - Modify each component to accept CMS data as props
   - Add data-cms-* attributes for visual editing
   - Maintain existing functionality (carousel, form validation, etc.)

3. **Create Content Service**
   - Build API to fetch home page content
   - Implement caching strategy
   - Handle fallbacks for missing content

4. **Test Integration**
   - Verify all fields update correctly
   - Test with different content lengths
   - Ensure responsive behavior maintained

5. **Documentation**
   - Create CMS user guide
   - Document content best practices
   - Provide example content

---

## Related Documentation

- **Full CMS Mapping:** `home-page-cms-mapping.md`
- **Contact Page Mapping:** `contact-cms-mapping.md`
- **About Page Mapping:** `about-page-implementation-summary.md`
- **Component Documentation:** Individual component files in `src/components/marketing/`






