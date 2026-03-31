# Home Page CMS - Visual Diagrams

Quick visual reference diagrams for the home page CMS structure.

---

## 🗺️ Page Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         USER LANDS ON /                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SECTION 1: HERO SECTION                      │
│                                                                 │
│  ┌────────────────────┐              ┌────────────────────┐    │
│  │  SOCIAL PROOF      │              │   SIGNUP FORM      │    │
│  │  • Testimonials    │              │   • OAuth Buttons  │    │
│  │  • Media Mentions  │              │   • Email/Phone    │    │
│  │  • Auto-rotate     │              │   • Terms Checkbox │    │
│  │  • Manual nav      │              │   • Submit Button  │    │
│  └────────────────────┘              └────────────────────┘    │
│                                                                 │
│                    [Scroll Indicator ↓]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              SECTION 2: PLATFORM & PRICING                      │
│                                                                 │
│  ┌──────────────────────┐         ┌────────────────────┐       │
│  │  PLATFORM FEATURES   │         │  PRICING PREVIEW   │       │
│  │  ┌────┐  ┌────┐     │         │  [Monthly|Yearly]  │       │
│  │  │ F1 │  │ F2 │     │         │  ┌──────────────┐  │       │
│  │  └────┘  └────┘     │         │  │ Free         │  │       │
│  │  ┌────┐  ┌────┐     │         │  ├──────────────┤  │       │
│  │  │ F3 │  │ F4 │     │         │  │ Pro ⭐       │  │       │
│  │  └────┘  └────┘     │         │  ├──────────────┤  │       │
│  └──────────────────────┘         │  │ Enterprise   │  │       │
│                                    │  └──────────────┘  │       │
│                                    │  [↑] Scroll [↓]    │       │
│                                    └────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│               SECTION 3: CTA & SOLUTIONS                        │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────────┐         │
│  │  CTA SECTION     │         │  SOLUTIONS OVERVIEW  │         │
│  │  • Title         │         │  ┌────┐  ┌────┐     │         │
│  │  • Description   │         │  │ S1 │  │ S2 │     │         │
│  │  • [CTA Button]  │         │  └────┘  └────┘     │         │
│  │  • Trust Items   │         │  ┌────┐  ┌────┐     │         │
│  │    ✓ Item 1      │         │  │ S3 │  │ S4 │     │         │
│  │    ✓ Item 2      │         │  └────┘  └────┘     │         │
│  │    ✓ Item 3      │         │                      │         │
│  └──────────────────┘         └──────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                         [Footer Navigation]
```

---

## 🏗️ Component Architecture

```
HomePage
│
├── DynamicBgSection
│   ├── Props: backgroundImage
│   └── Children: Hero content
│       │
│       ├── SocialProofCarousel
│       │   ├── Props: socialProof[]
│       │   ├── State: currentIndex
│       │   └── Features:
│       │       ├── Auto-rotation (5s)
│       │       ├── Manual navigation
│       │       └── Two content types
│       │
│       ├── SignupHero
│       │   ├── Props: lang, signupForm
│       │   ├── State: email, phone, accepted
│       │   └── Features:
│       │       ├── OAuth providers
│       │       ├── Form validation
│       │       └── Terms acceptance
│       │
│       └── ScrollIndicator
│           ├── Props: text, targetId
│           └── Features:
│               └── Smooth scroll
│
├── PlatformPricingSection
│   │
│   ├── PlatformFeatures
│   │   ├── Props: lang, features
│   │   └── Features:
│   │       ├── 4 feature cards
│   │       ├── Icon rendering
│   │       └── Grid layout
│   │
│   └── PricingPreview
│       ├── Props: lang, pricing
│       ├── State: billing, scroll
│       └── Features:
│           ├── Billing toggle
│           ├── Scrollable tiers
│           ├── Scroll controls
│           └── Height matching
│
└── CTASolutionsSection
    │
    ├── CTASection
    │   ├── Props: lang, cta
    │   └── Features:
    │       ├── CTA button
    │       └── Trust indicators
    │
    └── SolutionsOverview
        ├── Props: lang, solutions
        └── Features:
            ├── 4 solution cards
            ├── Icon rendering
            └── Grid layout
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│     CMS     │
│  (Content)  │
└──────┬──────┘
       │
       │ API Request
       ▼
┌─────────────────────┐
│  Content Service    │
│  getHomePageContent │
└──────┬──────────────┘
       │
       │ Returns JSON
       ▼
┌─────────────────────┐
│   HomePage          │
│   (Server Component)│
└──────┬──────────────┘
       │
       │ Props
       ├──────────────────────────────┐
       │                              │
       ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│ Hero Components │          │ Other Sections  │
│ • Carousel      │          │ • Features      │
│ • Signup Form   │          │ • Pricing       │
│ • Scroll        │          │ • CTA           │
└─────────────────┘          │ • Solutions     │
                             └─────────────────┘
       │                              │
       │ Render                       │ Render
       ▼                              ▼
┌─────────────────────────────────────────────┐
│            Browser (User View)              │
└─────────────────────────────────────────────┘
```

---

## 🔄 Content Update Flow

```
┌─────────────────┐
│ Content Editor  │
│ Updates CMS     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CMS Platform   │
│  Saves Changes  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Webhook/Event  │
│  Triggered      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js ISR    │
│  Revalidates    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cache Updated  │
│  (CDN/Edge)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Sees New  │
│  Content        │
└─────────────────┘

Timeline: 1-5 minutes
```

---

## 🎨 Responsive Layout Transformations

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────────┐
│ Hero Section                                        │
│ ┌──────────────────────┐  ┌──────────────────────┐ │
│ │                      │  │                      │ │
│ │   Carousel (66%)     │  │  Signup Form (33%)   │ │
│ │                      │  │                      │ │
│ └──────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Platform & Pricing                                  │
│ ┌──────────────────────┐  ┌──────────────────────┐ │
│ │ Features (66%)       │  │ Pricing (33%)        │ │
│ │ ┌────┐  ┌────┐      │  │ ┌──────────────────┐ │ │
│ │ │ F1 │  │ F2 │      │  │ │ Free             │ │ │
│ │ └────┘  └────┘      │  │ ├──────────────────┤ │ │
│ │ ┌────┐  ┌────┐      │  │ │ Pro              │ │ │
│ │ │ F3 │  │ F4 │      │  │ ├──────────────────┤ │ │
│ │ └────┘  └────┘      │  │ │ Enterprise       │ │ │
│ └──────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CTA & Solutions                                     │
│ ┌──────────────────────┐  ┌──────────────────────┐ │
│ │ CTA (33%)            │  │ Solutions (66%)      │ │
│ │                      │  │ ┌────┐  ┌────┐      │ │
│ │                      │  │ │ S1 │  │ S2 │      │ │
│ │                      │  │ └────┘  └────┘      │ │
│ │                      │  │ ┌────┐  ┌────┐      │ │
│ │                      │  │ │ S3 │  │ S4 │      │ │
│ └──────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Mobile (<640px)
```
┌──────────────────┐
│ Hero Section     │
│ ┌──────────────┐ │
│ │ Signup Form  │ │
│ │              │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Carousel     │ │
│ │              │ │
│ └──────────────┘ │
└──────────────────┘

┌──────────────────┐
│ Platform &       │
│ Pricing          │
│ ┌──────────────┐ │
│ │ Feature 1    │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Feature 2    │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Feature 3    │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Feature 4    │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Pricing      │ │
│ │ (scrollable) │ │
│ └──────────────┘ │
└──────────────────┘

┌──────────────────┐
│ CTA & Solutions  │
│ ┌──────────────┐ │
│ │ Solution 1   │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Solution 2   │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Solution 3   │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Solution 4   │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ CTA          │ │
│ └──────────────┘ │
└──────────────────┘
```

---

## 🗂️ CMS Field Hierarchy (Tree View)

```
homePage
│
├─ hero
│  ├─ backgroundImage (image)
│  │
│  ├─ socialProof (collection)
│  │  ├─ [0]
│  │  │  ├─ id
│  │  │  ├─ type ("testimonial" | "media")
│  │  │  ├─ quote
│  │  │  ├─ author (if testimonial)
│  │  │  ├─ title (if testimonial)
│  │  │  └─ publication (if media)
│  │  ├─ [1] ...
│  │  └─ [n] ...
│  │
│  ├─ signupForm
│  │  ├─ title
│  │  ├─ subtitle
│  │  ├─ oauthProviders (array)
│  │  │  ├─ [0] "Google"
│  │  │  ├─ [1] "Apple"
│  │  │  └─ [2] "Microsoft"
│  │  ├─ dividerText
│  │  ├─ emailLabel
│  │  ├─ emailPlaceholder
│  │  ├─ phoneLabel
│  │  ├─ phonePlaceholder
│  │  ├─ termsTextBefore
│  │  ├─ privacyLinkText
│  │  ├─ privacyLinkUrl
│  │  ├─ termsTextMiddle
│  │  ├─ termsLinkText
│  │  ├─ termsLinkUrl
│  │  ├─ submitButtonText
│  │  └─ submitButtonUrl
│  │
│  └─ scrollIndicator
│     ├─ text
│     └─ targetId
│
├─ platformPricing
│  ├─ features
│  │  ├─ title
│  │  ├─ subtitle
│  │  └─ cards (collection)
│  │     ├─ [0]
│  │     │  ├─ id
│  │     │  ├─ icon
│  │     │  ├─ title
│  │     │  ├─ description
│  │     │  ├─ linkText
│  │     │  └─ linkUrl
│  │     ├─ [1] ...
│  │     ├─ [2] ...
│  │     └─ [3] ...
│  │
│  └─ pricing
│     ├─ title
│     ├─ subtitle
│     ├─ monthlyLabel
│     ├─ yearlyLabel
│     ├─ defaultBilling
│     ├─ scrollLabel
│     ├─ footerLinkText
│     ├─ footerLinkUrl
│     └─ tiers (collection)
│        ├─ [0]
│        │  ├─ id
│        │  ├─ name
│        │  ├─ description
│        │  ├─ monthlyPrice
│        │  ├─ yearlyPrice
│        │  ├─ buttonText
│        │  ├─ buttonUrl
│        │  ├─ highlighted
│        │  └─ features (array)
│        │     ├─ [0] "Feature 1"
│        │     └─ [1] "Feature 2"
│        ├─ [1] ...
│        └─ [2] ...
│
└─ ctaSolutions
   ├─ cta
   │  ├─ title
   │  ├─ description
   │  ├─ buttonText
   │  ├─ buttonUrl
   │  └─ trustIndicators (array)
   │     ├─ [0] "No credit card required"
   │     ├─ [1] "Free templates"
   │     └─ [2] "Cancel anytime"
   │
   └─ solutions
      ├─ title
      ├─ subtitle
      └─ cards (collection)
         ├─ [0]
         │  ├─ id
         │  ├─ icon
         │  ├─ title
         │  ├─ description
         │  ├─ linkText
         │  └─ linkUrl
         ├─ [1] ...
         ├─ [2] ...
         └─ [3] ...
```

---

## 🎯 Interactive Elements Map

```
┌─────────────────────────────────────────────────────┐
│ HERO SECTION                                        │
│                                                     │
│ [1] OAuth Buttons (3)                              │
│     └─ Action: Redirect to OAuth provider          │
│                                                     │
│ [2] Email Input                                     │
│     └─ Action: Update state, validate              │
│                                                     │
│ [3] Phone Input                                     │
│     └─ Action: Update state, validate              │
│                                                     │
│ [4] Terms Checkbox                                  │
│     └─ Action: Toggle acceptance state             │
│                                                     │
│ [5] Privacy Policy Link                            │
│     └─ Action: Navigate to privacy page            │
│                                                     │
│ [6] Terms of Use Link                              │
│     └─ Action: Navigate to terms page              │
│                                                     │
│ [7] Get Started Button                             │
│     └─ Action: Submit form / Navigate              │
│                                                     │
│ [8] Carousel Navigation Dots (4+)                  │
│     └─ Action: Jump to specific slide              │
│                                                     │
│ [9] Scroll Indicator                               │
│     └─ Action: Smooth scroll to next section       │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ PLATFORM & PRICING SECTION                          │
│                                                     │
│ [10] Feature Card Links (4)                        │
│      └─ Action: Navigate to feature page           │
│                                                     │
│ [11] Billing Toggle (Monthly/Yearly)               │
│      └─ Action: Switch pricing display             │
│                                                     │
│ [12] Pricing Tier Buttons (3)                      │
│      └─ Action: Navigate to contact/signup         │
│                                                     │
│ [13] Scroll Up Button                              │
│      └─ Action: Scroll pricing tiers up            │
│                                                     │
│ [14] Scroll Down Button                            │
│      └─ Action: Scroll pricing tiers down          │
│                                                     │
│ [15] Detailed Pricing Link                         │
│      └─ Action: Navigate to pricing page           │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CTA & SOLUTIONS SECTION                             │
│                                                     │
│ [16] CTA Button                                     │
│      └─ Action: Navigate to contact/signup         │
│                                                     │
│ [17] Solution Card Links (4)                       │
│      └─ Action: Navigate to solution page          │
│                                                     │
└─────────────────────────────────────────────────────┘

Total Interactive Elements: 17+ (varies with collections)
```

---

## 📱 Touch Target Sizes (Mobile)

```
Element Type          Desktop    Mobile     Notes
─────────────────────────────────────────────────────
OAuth Buttons         40px       44px       Touch-friendly
Form Inputs           40px       44px       Larger on mobile
Checkbox              16px       20px       Larger tap area
Submit Button         40px       48px       Primary action
Carousel Dots         8px        12px       Easier to tap
Links                 auto       44px min   Adequate spacing
Card Buttons          40px       44px       Full-width mobile
Scroll Controls       32px       44px       Easier interaction

Minimum Touch Target: 44px × 44px (iOS/Android guidelines)
```

---

## 🎨 Color Coding by CMS Field Type

```
Legend:
🔵 Text Field
🟢 Rich Text
🟡 URL/Link
🟣 Image
🔴 Collection
🟠 Select/Enum
⚪ Boolean

homePage
├─ 🟣 hero.backgroundImage
├─ 🔴 hero.socialProof[]
│  ├─ 🟠 type
│  ├─ 🔵 quote
│  ├─ 🔵 author
│  └─ 🔵 publication
├─ 🔵 hero.signupForm.title
├─ 🔵 hero.signupForm.subtitle
├─ 🔴 hero.signupForm.oauthProviders[]
├─ 🟡 hero.signupForm.submitButtonUrl
├─ 🔴 platformPricing.features.cards[]
│  ├─ 🟠 icon
│  ├─ 🔵 title
│  ├─ 🟢 description
│  └─ 🟡 linkUrl
├─ 🔴 platformPricing.pricing.tiers[]
│  ├─ 🔵 name
│  ├─ 🔵 monthlyPrice
│  ├─ ⚪ highlighted
│  └─ 🔴 features[]
└─ 🔴 ctaSolutions.solutions.cards[]
   ├─ 🟠 icon
   ├─ 🔵 title
   └─ 🟡 linkUrl
```

---

## 🔄 State Management Diagram

```
┌─────────────────────────────────────────────────────┐
│ Client-Side State (React useState)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ SocialProofCarousel:                                │
│   └─ currentIndex: number                           │
│      ├─ Auto-increment every 5s                     │
│      └─ Manual set via dot navigation               │
│                                                     │
│ SignupHero:                                         │
│   ├─ email: string                                  │
│   ├─ phone: string                                  │
│   └─ accepted: boolean                              │
│      └─ Validates: (email OR phone) AND accepted    │
│                                                     │
│ PricingPreview:                                     │
│   ├─ billing: "monthly" | "yearly"                  │
│   │  └─ Toggles price display                       │
│   ├─ canScrollUp: boolean                           │
│   └─ canScrollDown: boolean                         │
│      └─ Updates on scroll events                    │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Server-Side Data (CMS Content)                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Fetched once at build/request time                  │
│ Cached for performance                              │
│ Revalidated on CMS updates                          │
│                                                     │
│ All content fields from CMS                         │
│ Passed as props to components                       │
│ No client-side mutations                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Performance Budget

```
Metric                Target      Current     Status
─────────────────────────────────────────────────────
First Contentful Paint  < 1.8s     TBD        ⏳
Largest Contentful Paint < 2.5s    TBD        ⏳
Time to Interactive     < 3.8s     TBD        ⏳
Total Blocking Time     < 200ms    TBD        ⏳
Cumulative Layout Shift < 0.1      TBD        ⏳

Page Weight            Target      Current     Status
─────────────────────────────────────────────────────
HTML                   < 50KB      TBD        ⏳
CSS                    < 100KB     TBD        ⏳
JavaScript             < 200KB     TBD        ⏳
Images                 < 500KB     TBD        ⏳
Total                  < 850KB     TBD        ⏳

Lighthouse Score       Target      Current     Status
─────────────────────────────────────────────────────
Performance            > 90        TBD        ⏳
Accessibility          > 95        TBD        ⏳
Best Practices         > 95        TBD        ⏳
SEO                    > 95        TBD        ⏳
```

---

## 🎯 Implementation Priority Matrix

```
                    High Impact
                         │
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    │   DO FIRST         │   DO SECOND        │
    │                    │                    │
    │ • Hero Section     │ • Solutions Cards  │
    │ • Signup Form      │ • Trust Indicators │
    │ • Social Proof     │ • Scroll Indicator │
    │                    │                    │
Low ├────────────────────┼────────────────────┤ High
Effort                   │                  Effort
    │                    │                    │
    │   DO THIRD         │   DO LAST          │
    │                    │                    │
    │ • CTA Section      │ • Pricing Preview  │
    │ • Feature Cards    │   (complex scroll) │
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
                    Low Impact
```

---

## 🔍 Testing Coverage Map

```
Component              Unit   Integration   E2E   Visual
──────────────────────────────────────────────────────────
DynamicBgSection       ✓      ✓             ✓     ✓
SocialProofCarousel    ✓      ✓             ✓     ✓
SignupHero             ✓      ✓             ✓     ✓
ScrollIndicator        ✓      ✓             ✓     -
PlatformFeatures       ✓      ✓             ✓     ✓
PricingPreview         ✓      ✓             ✓     ✓
CTASection             ✓      ✓             ✓     ✓
SolutionsOverview      ✓      ✓             ✓     ✓

Coverage Target:       80%    70%           60%   50%
```

---

**For more detailed information, see:**
- [Full CMS Mapping](./home-page-cms-mapping.md)
- [Visual Structure](./home-page-structure-visual.md)
- [Quick Reference](./home-page-cms-quick-reference.md)
- [Executive Summary](./home-page-cms-summary.md)






