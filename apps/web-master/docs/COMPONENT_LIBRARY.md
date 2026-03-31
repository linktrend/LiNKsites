# Component Library Documentation

**Version:** 1.0.0  
**Last Updated:** December 5, 2025  
**Total Components:** 77 components across 11 categories

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Component Categories](#component-categories)
   - [Marketing Components](#marketing-components)
   - [Common/Shared Components](#commonshared-components)
   - [Contact Components](#contact-components)
   - [Help Center Components](#help-center-components)
   - [Navigation Components](#navigation-components)
   - [Pricing Components](#pricing-components)
   - [Resource Components](#resource-components)
   - [UI Components](#ui-components)
   - [Modal Components](#modal-components)
   - [Layout Components](#layout-components)
   - [Icon Components](#icon-components)
   - [About Components](#about-components)
4. [Component Conventions](#component-conventions)
5. [Common Patterns](#common-patterns)
6. [For AI Agents](#for-ai-agents)

---

## Overview

This document provides comprehensive documentation for all components in the Master Template. Components are organized by category and include:

- **Purpose**: What the component does
- **Props**: All available properties with types
- **Use Cases**: Where and when to use the component
- **Examples**: Code examples showing usage
- **Features**: Key capabilities (where applicable)

### Component Types

- **Client Components** (62): Use `"use client"` directive, support interactivity
- **Server Components** (15): Default Next.js components, no client-side JavaScript
- **Layout Components** (11): Page-level layout wrappers

### JSON Index

For machine-readable component metadata (ideal for AI agents), see: `docs/components/index.json`

---

## Quick Start

### Basic Usage

```tsx
import { Button } from "@/components/ui/button";
import { SignupHero } from "@/components/marketing/SignupHero";

export default function Page() {
  return (
    <div>
      <SignupHero lang="en" />
      <Button variant="outline">Click me</Button>
    </div>
  );
}
```

### Importing Components

All components use absolute imports from `@/components/`:

```tsx
import { ComponentName } from "@/components/category/ComponentName";
```

### Styling

Components use Tailwind CSS with design tokens from `src/styles/tokens.css`. Use token-based classes:

```tsx
<div className="bg-primary text-primary-foreground rounded-md">
  Content
</div>
```

---

## Component Categories

## Marketing Components

**Location:** `src/components/marketing/`  
**Purpose:** Marketing and promotional components for homepage and landing pages  
**Count:** 13 components

### SignupHero

**Type:** Client Component  
**File:** `src/components/marketing/SignupHero.tsx`

Large hero section with email/phone signup form, OAuth buttons, and trust indicators.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code for internationalization |

**Features:**
- OAuth integration (Google, Apple, Microsoft)
- Email/phone validation with react-hook-form + Zod
- Terms acceptance checkbox
- Trust indicators with checkmarks
- Responsive design with mobile optimization
- Hydration-safe rendering

**Use Cases:**
- Homepage hero
- Landing pages
- Signup pages

**Example:**

```tsx
import { SignupHero } from "@/components/marketing/SignupHero";

export default function HomePage() {
  return <SignupHero lang="en" />;
}
```

---

### CTASection

**Type:** Client Component  
**File:** `src/components/marketing/CTASection.tsx`

Call-to-action card with trust indicators and primary button.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code for routing |

**Features:**
- Trust indicators with checkmarks
- Gradient background
- Responsive sizing
- Internationalized content

**Use Cases:**
- Homepage conversion points
- Sidebar CTAs
- Content marketing sections

**Example:**

```tsx
import { CTASection } from "@/components/marketing/CTASection";

<CTASection lang="en" />
```

---

### OfferShowcase

**Type:** Client Component  
**File:** `src/components/marketing/OfferShowcase.tsx`

Dynamic showcase for offers - displays as featured block (1 offer) or carousel (multiple offers).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `offers` | `CmsOffer[]` | ✅ | Array of offer objects from CMS |

**Features:**
- Auto-rotating carousel (6-second intervals)
- Single offer featured display
- Icon mapping for visual branding
- Responsive navigation arrows
- Dot indicators
- Pause on hover/touch

**Use Cases:**
- Homepage product showcase
- Offers landing page
- Product/service listings

**Example:**

```tsx
import { OfferShowcase } from "@/components/marketing/OfferShowcase";

<OfferShowcase lang="en" offers={offersFromCMS} />
```

---

### ArticlesGrid

**Type:** Client Component  
**File:** `src/components/marketing/ArticlesGrid.tsx`

Grid display of article cards with images and metadata.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `articles` | `CmsResource[]` | ✅ | Array of article objects |

**Use Cases:**
- Homepage article preview
- Resources page
- Blog listing

**Example:**

```tsx
<ArticlesGrid lang="en" articles={articles} />
```

---

### CaseStudiesGrid

**Type:** Client Component  
**File:** `src/components/marketing/CaseStudiesGrid.tsx`

Grid display of case study cards.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `caseStudies` | `CmsCase[]` | ✅ | Array of case study objects |

**Use Cases:**
- Homepage social proof
- Case studies page
- Testimonials section

**Example:**

```tsx
<CaseStudiesGrid lang="en" caseStudies={cases} />
```

---

### DynamicBgSection

**Type:** Client Component  
**File:** `src/components/marketing/DynamicBgSection.tsx`

Hero section with dynamic gradient background.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Section title |
| `subtitle` | `string` | ❌ | Section subtitle |
| `ctaLabel` | `string` | ❌ | CTA button text |
| `ctaUrl` | `string` | ❌ | CTA button URL |

**Use Cases:**
- Hero sections
- Landing pages
- Feature sections

**Example:**

```tsx
<DynamicBgSection 
  title="Welcome to Our Platform" 
  subtitle="Get started today"
  ctaLabel="Sign Up"
  ctaUrl="/signup"
/>
```

---

### StaticBgSection

**Type:** Client Component  
**File:** `src/components/marketing/StaticBgSection.tsx`

Hero section with static background image.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `backgroundImage` | `string` | ✅ | Image URL or path |
| `title` | `string` | ✅ | Section title |
| `description` | `string` | ❌ | Section description |

**Use Cases:**
- About page hero
- Secondary page headers
- Content sections

**Example:**

```tsx
<StaticBgSection 
  backgroundImage="/images/hero.jpg"
  title="About Our Company"
  description="Learn more about who we are"
/>
```

---

### PlatformFeatures

**Type:** Client Component  
**File:** `src/components/marketing/PlatformFeatures.tsx`

Feature showcase with icons and descriptions.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Homepage features section
- Product features page
- Benefits overview

**Example:**

```tsx
<PlatformFeatures lang="en" />
```

---

### PricingHomepage

**Type:** Client Component  
**File:** `src/components/marketing/PricingHomepage.tsx`

Pricing preview section for homepage.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Homepage pricing preview
- Quick pricing overview

**Example:**

```tsx
<PricingHomepage lang="en" />
```

---

### PricingPreview

**Type:** Client Component  
**File:** `src/components/marketing/PricingPreview.tsx`

Compact pricing preview component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Sidebar pricing
- Quick preview sections

**Example:**

```tsx
<PricingPreview lang="en" />
```

---

### SocialProofCarousel

**Type:** Client Component  
**File:** `src/components/marketing/SocialProofCarousel.tsx`

Auto-rotating carousel of testimonials and social proof.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `testimonials` | `array` | ✅ | Array of testimonial objects |

**Use Cases:**
- Homepage testimonials
- Social proof sections
- Customer stories

**Example:**

```tsx
<SocialProofCarousel testimonials={testimonialsData} />
```

---

### SolutionsOverview

**Type:** Client Component  
**File:** `src/components/marketing/SolutionsOverview.tsx`

Overview grid of solutions/services.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Homepage solutions section
- Solutions landing page

**Example:**

```tsx
<SolutionsOverview lang="en" />
```

---

### ScrollIndicator

**Type:** Client Component  
**File:** `src/components/marketing/ScrollIndicator.tsx`

Visual scroll progress indicator.

**Props:** None

**Use Cases:**
- Long-form content
- Articles
- Documentation pages

**Example:**

```tsx
<ScrollIndicator />
```

---

## Common/Shared Components

**Location:** `src/components/common/`  
**Purpose:** Shared utility components used across the site  
**Count:** 11 components

### CTA

**Type:** Server Component  
**File:** `src/components/common/CTA.tsx`

Simple call-to-action link button.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `href` | `string` | ✅ | - | Link destination |
| `label` | `string` | ✅ | - | Button text |
| `size` | `'sm' \| 'md'` | ❌ | `'md'` | Button size |
| `variant` | `'primary' \| 'accent'` | ❌ | `'primary'` | Color variant |

**Use Cases:**
- Call-to-action buttons
- Navigation links
- Conversion points

**Example:**

```tsx
import { CTA } from "@/components/common/CTA";

<CTA 
  href="/contact" 
  label="Get Started" 
  variant="accent" 
  size="md"
/>
```

---

### Breadcrumbs

**Type:** Client Component  
**File:** `src/components/common/Breadcrumbs.tsx`

Navigation breadcrumbs with schema.org markup for SEO.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `Array<{label: string, href: string}>` | ✅ | Breadcrumb items |

**Features:**
- SEO-friendly schema.org markup
- Responsive design
- Accessible navigation

**Use Cases:**
- Deep page navigation
- SEO enhancement
- User orientation

**Example:**

```tsx
<Breadcrumbs 
  items={[
    {label: 'Home', href: '/'},
    {label: 'Products', href: '/products'},
    {label: 'AI Platform', href: '/products/ai-platform'}
  ]} 
/>
```

---

### CookieConsentBanner

**Type:** Client Component  
**File:** `src/components/common/CookieConsentBanner.tsx`

GDPR-compliant cookie consent banner.

**Props:** None

**Features:**
- Granular consent (analytics vs marketing)
- LocalStorage persistence
- Consent revocation support
- GDPR/CCPA compliant
- Blocks analytics until consent given

**Use Cases:**
- GDPR compliance
- Privacy requirements
- Cookie management

**Example:**

```tsx
<CookieConsentBanner />
```

---

### CookiePreferencesButton

**Type:** Client Component  
**File:** `src/components/common/CookiePreferencesButton.tsx`

Button to open cookie preferences modal.

**Props:** None

**Use Cases:**
- Footer links
- Privacy settings

**Example:**

```tsx
<CookiePreferencesButton />
```

---

### ManageCookiesButton

**Type:** Client Component  
**File:** `src/components/common/ManageCookiesButton.tsx`

Button to manage cookie settings.

**Props:** None

**Use Cases:**
- Footer links
- Settings pages

**Example:**

```tsx
<ManageCookiesButton />
```

---

### Modal

**Type:** Client Component  
**File:** `src/components/common/Modal.tsx`

Generic modal dialog component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Modal open state |
| `onClose` | `() => void` | ✅ | Close handler |
| `title` | `string` | ❌ | Modal title |
| `children` | `ReactNode` | ✅ | Modal content |

**Use Cases:**
- Dialogs
- Popups
- Overlays

**Example:**

```tsx
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  title="Confirmation"
>
  <p>Are you sure?</p>
</Modal>
```

---

### NewsletterSection

**Type:** Client Component  
**File:** `src/components/common/NewsletterSection.tsx`

Newsletter signup form section.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Footer newsletter signup
- Sidebar email capture
- Content marketing

**Example:**

```tsx
<NewsletterSection lang="en" />
```

---

### ScrollToTop

**Type:** Client Component  
**File:** `src/components/common/ScrollToTop.tsx`

Floating button to scroll to top of page.

**Props:** None

**Features:**
- Appears after scrolling down
- Smooth scroll animation
- Accessible keyboard navigation

**Use Cases:**
- Long pages
- Articles
- Documentation

**Example:**

```tsx
<ScrollToTop />
```

---

### ClientOnly

**Type:** Client Component  
**File:** `src/components/common/ClientOnly.tsx`

Wrapper to render children only on client-side (prevents hydration issues).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | ✅ | Content to render client-side only |

**Use Cases:**
- Preventing hydration mismatches
- Client-only features (localStorage, window, etc.)
- Third-party widgets

**Example:**

```tsx
<ClientOnly>
  <ComponentThatUsesWindow />
</ClientOnly>
```

---

### AnalyticsInitializer

**Type:** Client Component  
**File:** `src/components/common/AnalyticsInitializer.tsx`

Initializes analytics scripts based on user consent.

**Props:** None

**Features:**
- Consent-gated analytics loading
- Supports GA4, Facebook Pixel, LinkedIn, Hotjar
- Privacy-compliant

**Use Cases:**
- Analytics initialization
- Tracking setup
- Privacy compliance

**Example:**

```tsx
<AnalyticsInitializer />
```

---

### WebVitalsMonitor

**Type:** Client Component  
**File:** `src/components/common/WebVitalsMonitor.tsx`

Monitors and reports Core Web Vitals.

**Props:** None

**Features:**
- Tracks LCP, FID, CLS, TTFB, FCP
- Reports to analytics
- Performance monitoring

**Use Cases:**
- Performance monitoring
- Web vitals tracking
- User experience metrics

**Example:**

```tsx
<WebVitalsMonitor />
```

---

## Contact Components

**Location:** `src/components/contact/`  
**Purpose:** Contact page components and forms  
**Count:** 11 components

### ContactForm

**Type:** Client Component  
**File:** `src/components/contact/ContactForm.tsx`

Main contact form with validation.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `lang` | `string` | ❌ | `'en'` | Language code |

**Features:**
- Zod schema validation
- Success/error states
- CAPTCHA verification
- Internationalization
- Form submission handling

**Use Cases:**
- Contact page
- Support inquiries
- General contact

**Example:**

```tsx
<ContactForm lang="en" />
```

---

### DynamicContactForm

**Type:** Client Component  
**File:** `src/components/contact/DynamicContactForm.tsx`

Dynamic form that adapts based on intent/purpose.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `intent` | `string` | ❌ | Contact intent (sales, support, etc.) |
| `lang` | `string` | ❌ | Language code |

**Features:**
- Adaptive field display
- Intent-based routing
- Dynamic validation

**Use Cases:**
- Multi-purpose contact forms
- Intent-based routing
- Customized inquiries

**Example:**

```tsx
<DynamicContactForm intent="sales" lang="en" />
```

---

### ContactFormContext

**Type:** Client Component  
**File:** `src/components/contact/ContactFormContext.tsx`

Context provider for contact form state management.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | ✅ | Child components |

**Use Cases:**
- Form state management
- Shared form context

**Example:**

```tsx
<ContactFormContext>
  <ContactForm />
</ContactFormContext>
```

---

### ContactPageContent

**Type:** Client Component  
**File:** `src/components/contact/ContactPageContent.tsx`

Complete contact page layout with form and info.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Contact page

**Example:**

```tsx
<ContactPageContent lang="en" />
```

---

### ContactChannelCard

**Type:** Client Component  
**File:** `src/components/contact/ContactChannelCard.tsx`

Card displaying a contact channel (email, phone, etc.).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `ReactNode` | ✅ | Channel icon |
| `title` | `string` | ✅ | Channel title |
| `value` | `string` | ✅ | Contact value |
| `href` | `string` | ❌ | Link URL |

**Use Cases:**
- Contact information display
- Channel listings

**Example:**

```tsx
<ContactChannelCard 
  icon={<Mail />} 
  title="Email" 
  value="hello@example.com"
  href="mailto:hello@example.com"
/>
```

---

### ContactChannelList

**Type:** Client Component  
**File:** `src/components/contact/ContactChannelList.tsx`

List of contact channels.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Contact page
- Footer contact info

**Example:**

```tsx
<ContactChannelList lang="en" />
```

---

### GoogleMapEmbed

**Type:** Client Component  
**File:** `src/components/contact/GoogleMapEmbed.tsx`

Embedded Google Maps location.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `location` | `string` | ✅ | Location address or coordinates |

**Use Cases:**
- Contact page
- Office location
- Store locator

**Example:**

```tsx
<GoogleMapEmbed location="New York, NY" />
```

---

### HelpDeflectionSection

**Type:** Client Component  
**File:** `src/components/contact/HelpDeflectionSection.tsx`

Section suggesting help articles before contacting support.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Features:**
- Reduces support load
- Self-service encouragement
- Quick help links

**Use Cases:**
- Contact page
- Support deflection
- Self-service

**Example:**

```tsx
<HelpDeflectionSection lang="en" />
```

---

### IntentCard

**Type:** Client Component  
**File:** `src/components/contact/IntentCard.tsx`

Card for selecting contact intent/purpose.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `intent` | `string` | ✅ | Intent identifier |
| `icon` | `ReactNode` | ✅ | Intent icon |
| `title` | `string` | ✅ | Intent title |
| `description` | `string` | ✅ | Intent description |
| `onClick` | `() => void` | ✅ | Click handler |

**Use Cases:**
- Intent selection
- Contact routing

**Example:**

```tsx
<IntentCard 
  intent="sales"
  icon={<Briefcase />}
  title="Sales Inquiry"
  description="Talk to our sales team"
  onClick={() => handleIntentSelect('sales')}
/>
```

---

### IntentGrid

**Type:** Client Component  
**File:** `src/components/contact/IntentGrid.tsx`

Grid of intent selection cards.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `onIntentSelect` | `(intent: string) => void` | ✅ | Selection handler |

**Use Cases:**
- Contact page
- Intent-based routing

**Example:**

```tsx
<IntentGrid 
  lang="en" 
  onIntentSelect={(intent) => console.log(intent)}
/>
```

---

### TrustFooter

**Type:** Client Component  
**File:** `src/components/contact/TrustFooter.tsx`

Trust indicators for contact page footer.

**Props:** None

**Use Cases:**
- Contact page
- Trust building
- Reassurance

**Example:**

```tsx
<TrustFooter />
```

---

## Help Center Components

**Location:** `src/components/help/`  
**Purpose:** Help center and documentation components  
**Count:** 9 components

### HelpCentreHero

**Type:** Client Component  
**File:** `src/components/help/HelpCentreHero.tsx`

Hero section for help center with search.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Help center landing
- Documentation home
- Support portal

**Example:**

```tsx
<HelpCentreHero lang="en" />
```

---

### HelpSearchField

**Type:** Client Component  
**File:** `src/components/help/HelpSearchField.tsx`

Search input for help articles.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Help center search
- Article discovery

**Example:**

```tsx
<HelpSearchField lang="en" />
```

---

### HelpCategoryHeader

**Type:** Client Component  
**File:** `src/components/help/HelpCategoryHeader.tsx`

Header for help category pages.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `category` | `string` | ✅ | Category name |
| `description` | `string` | ❌ | Category description |

**Use Cases:**
- Help category pages
- Documentation sections

**Example:**

```tsx
<HelpCategoryHeader 
  category="Getting Started" 
  description="Learn the basics"
/>
```

---

### HelpArticleList

**Type:** Client Component  
**File:** `src/components/help/HelpArticleList.tsx`

List of help articles.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `articles` | `array` | ✅ | Array of article objects |
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Help center
- Article listings

**Example:**

```tsx
<HelpArticleList articles={articles} lang="en" />
```

---

### HelpArticleHeader

**Type:** Client Component  
**File:** `src/components/help/HelpArticleHeader.tsx`

Header for individual help article.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Article title |
| `lastUpdated` | `string` | ❌ | Last update date |

**Use Cases:**
- Help articles
- Documentation pages

**Example:**

```tsx
<HelpArticleHeader 
  title="How to get started" 
  lastUpdated="2025-12-01"
/>
```

---

### HelpArticleBody

**Type:** Client Component  
**File:** `src/components/help/HelpArticleBody.tsx`

Rich text body content for help articles.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `content` | `string` | ✅ | Article content (HTML or markdown) |

**Use Cases:**
- Help articles
- Documentation content

**Example:**

```tsx
<HelpArticleBody content={articleContent} />
```

---

### HelpArticleFeedback

**Type:** Client Component  
**File:** `src/components/help/HelpArticleFeedback.tsx`

Feedback widget for help articles (Was this helpful?).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `articleId` | `string` | ✅ | Article identifier |

**Features:**
- Thumbs up/down feedback
- Feedback submission
- Analytics tracking

**Use Cases:**
- Help articles
- Content quality tracking

**Example:**

```tsx
<HelpArticleFeedback articleId="getting-started-123" />
```

---

### HelpArticleRelated

**Type:** Client Component  
**File:** `src/components/help/HelpArticleRelated.tsx`

Related articles section.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `articles` | `array` | ✅ | Related article objects |
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Help articles
- Related content

**Example:**

```tsx
<HelpArticleRelated articles={relatedArticles} lang="en" />
```

---

### HelpBreadcrumbs

**Type:** Client Component  
**File:** `src/components/help/HelpBreadcrumbs.tsx`

Breadcrumb navigation for help center.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `array` | ✅ | Breadcrumb items |

**Use Cases:**
- Help center navigation
- Documentation structure

**Example:**

```tsx
<HelpBreadcrumbs items={breadcrumbItems} />
```

---

## Navigation Components

**Location:** `src/components/navigation/`  
**Purpose:** Site navigation components (header and footer)  
**Count:** 2 components

### Header

**Type:** Client Component  
**File:** `src/components/navigation/Header.tsx`

Main site header with navigation, language selector, and theme toggle.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `lang` | `string` | ✅ | - | Language code |
| `navigation` | `CmsNavigation & { offersLabel: string }` | ✅ | - | Navigation data |
| `showNavigation` | `boolean` | ✅ | - | Show/hide navigation |
| `offers` | `array` | ❌ | `[]` | Offers for dropdown |

**Features:**
- Responsive mobile menu (Sheet component)
- Dropdown menus for offers and resources
- Theme toggle (light/dark mode)
- Language selector
- Sticky header
- Hydration-safe rendering

**Use Cases:**
- Site header (all pages)
- Global navigation

**Example:**

```tsx
<Header 
  lang="en" 
  navigation={navigationData} 
  showNavigation={true}
  offers={offersData}
/>
```

---

### Footer

**Type:** Client Component  
**File:** `src/components/navigation/Footer.tsx`

Site footer with links, social media, and legal.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Features:**
- Multi-column layout
- Social media links
- Legal links
- Newsletter signup
- Responsive design

**Use Cases:**
- Site footer (all pages)
- Global links

**Example:**

```tsx
<Footer lang="en" />
```

---

## Pricing Components

**Location:** `src/components/pricing/`  
**Purpose:** Pricing and plan components  
**Count:** 2 components

### PricingPageContent

**Type:** Client Component  
**File:** `src/components/pricing/PricingPageContent.tsx`

Complete pricing page with plan comparison.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Pricing page

**Example:**

```tsx
<PricingPageContent lang="en" />
```

---

### PricingToggle

**Type:** Client Component  
**File:** `src/components/pricing/PricingToggle.tsx`

Toggle between monthly/annual pricing.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `'monthly' \| 'annual'` | ✅ | Current billing period |
| `onChange` | `(value: 'monthly' \| 'annual') => void` | ✅ | Change handler |

**Use Cases:**
- Pricing page
- Billing period selection

**Example:**

```tsx
<PricingToggle 
  value={billingPeriod} 
  onChange={setBillingPeriod}
/>
```

---

## Resource Components

**Location:** `src/components/resources/`  
**Purpose:** Resource and content listing components  
**Count:** 5 components

### ResourcesPageContent

**Type:** Client Component  
**File:** `src/components/resources/ResourcesPageContent.tsx`

Main resources landing page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Resources landing page
- Content hub

**Example:**

```tsx
<ResourcesPageContent lang="en" />
```

---

### ArticlesPageContent

**Type:** Client Component  
**File:** `src/components/resources/ArticlesPageContent.tsx`

Articles listing page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `articles` | `CmsResource[]` | ✅ | Array of articles |

**Use Cases:**
- Articles page
- Blog listing

**Example:**

```tsx
<ArticlesPageContent lang="en" articles={articles} />
```

---

### CaseStudiesPageContent

**Type:** Client Component  
**File:** `src/components/resources/CaseStudiesPageContent.tsx`

Case studies listing page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `caseStudies` | `CmsCase[]` | ✅ | Array of case studies |

**Use Cases:**
- Case studies page
- Testimonials

**Example:**

```tsx
<CaseStudiesPageContent lang="en" caseStudies={cases} />
```

---

### VideosPageContent

**Type:** Client Component  
**File:** `src/components/resources/VideosPageContent.tsx`

Videos listing page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `videos` | `CmsVideo[]` | ✅ | Array of videos |

**Use Cases:**
- Videos page
- Media library

**Example:**

```tsx
<VideosPageContent lang="en" videos={videos} />
```

---

### HelpCentrePageContent

**Type:** Client Component  
**File:** `src/components/resources/HelpCentrePageContent.tsx`

Help center landing page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Help center
- Support portal

**Example:**

```tsx
<HelpCentrePageContent lang="en" />
```

---

## UI Components

**Location:** `src/components/ui/`  
**Purpose:** Base UI components (shadcn/ui based)  
**Count:** 9 components

### Button

**Type:** Server Component  
**File:** `src/components/ui/button.tsx`

Base button component with variants.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'default' \| 'secondary' \| 'ghost' \| 'outline'` | ❌ | `'default'` | Button style variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | ❌ | `'default'` | Button size |
| `asChild` | `boolean` | ❌ | `false` | Render as child (e.g., Link) |

**Features:**
- Multiple style variants
- Size options
- Focus states
- Disabled states
- Accessible

**Use Cases:**
- Buttons
- Actions
- Forms

**Example:**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline" size="lg">Click me</Button>

// As Link
<Button asChild>
  <Link href="/about">Learn More</Link>
</Button>
```

---

### Card

**Type:** Server Component  
**File:** `src/components/ui/card.tsx`

Card container with header, content, and footer sections.

**Props:** None (uses composition)

**Sub-components:**
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title text
- `CardDescription`: Description text
- `CardContent`: Main content area
- `CardFooter`: Footer section

**Use Cases:**
- Cards
- Content blocks
- Feature boxes

**Example:**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>
```

---

### Input

**Type:** Server Component  
**File:** `src/components/ui/input.tsx`

Base input field component.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `string` | ❌ | `'text'` | Input type |

**Use Cases:**
- Forms
- Text inputs
- Search fields

**Example:**

```tsx
<Input type="email" placeholder="Enter email" />
```

---

### Label

**Type:** Server Component  
**File:** `src/components/ui/label.tsx`

Form label component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `htmlFor` | `string` | ❌ | Associated input ID |

**Use Cases:**
- Form labels
- Accessibility

**Example:**

```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

---

### Checkbox

**Type:** Client Component  
**File:** `src/components/ui/checkbox.tsx`

Checkbox input component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `checked` | `boolean` | ❌ | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | ❌ | Change handler |

**Use Cases:**
- Forms
- Checkboxes
- Multi-select

**Example:**

```tsx
<Checkbox 
  checked={accepted} 
  onCheckedChange={setAccepted}
/>
```

---

### Switch

**Type:** Client Component  
**File:** `src/components/ui/switch.tsx`

Toggle switch component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `checked` | `boolean` | ❌ | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | ❌ | Change handler |

**Use Cases:**
- Toggles
- Settings
- Boolean options

**Example:**

```tsx
<Switch 
  checked={enabled} 
  onCheckedChange={setEnabled}
/>
```

---

### Dialog

**Type:** Client Component  
**File:** `src/components/ui/dialog.tsx`

Modal dialog component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | ❌ | Open state |
| `onOpenChange` | `(open: boolean) => void` | ❌ | State change handler |

**Sub-components:**
- `Dialog`: Root component
- `DialogTrigger`: Trigger button
- `DialogContent`: Content container
- `DialogHeader`: Header section
- `DialogTitle`: Title text
- `DialogDescription`: Description text
- `DialogFooter`: Footer section

**Use Cases:**
- Modals
- Dialogs
- Confirmations

**Example:**

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <p>Content</p>
  </DialogContent>
</Dialog>
```

---

### DropdownMenu

**Type:** Client Component  
**File:** `src/components/ui/dropdown-menu.tsx`

Dropdown menu component.

**Props:** None (uses composition)

**Sub-components:**
- `DropdownMenu`: Root component
- `DropdownMenuTrigger`: Trigger button
- `DropdownMenuContent`: Content container
- `DropdownMenuItem`: Menu item
- `DropdownMenuSeparator`: Separator line

**Use Cases:**
- Menus
- Dropdowns
- Actions

**Example:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Sheet

**Type:** Client Component  
**File:** `src/components/ui/sheet.tsx`

Slide-out sheet/drawer component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | ❌ | Open state |
| `onOpenChange` | `(open: boolean) => void` | ❌ | State change handler |

**Sub-components:**
- `Sheet`: Root component
- `SheetTrigger`: Trigger button
- `SheetContent`: Content container
- `SheetHeader`: Header section
- `SheetTitle`: Title text
- `SheetDescription`: Description text

**Use Cases:**
- Mobile menus
- Sidebars
- Drawers

**Example:**

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger>Open Menu</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
    </SheetHeader>
    <nav>Navigation items</nav>
  </SheetContent>
</Sheet>
```

---

## Modal Components

**Location:** `src/components/modals/`  
**Purpose:** Modal and overlay components  
**Count:** 1 component

### CookiePreferencesModal

**Type:** Client Component  
**File:** `src/components/modals/CookiePreferencesModal.tsx`

Modal for managing cookie preferences.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Modal open state |
| `onClose` | `() => void` | ✅ | Close handler |

**Features:**
- Granular cookie control
- Analytics vs marketing separation
- Save preferences
- GDPR compliant

**Use Cases:**
- Privacy settings
- Cookie management
- Compliance

**Example:**

```tsx
<CookiePreferencesModal 
  isOpen={modalOpen} 
  onClose={() => setModalOpen(false)}
/>
```

---

## Layout Components

**Location:** `src/layouts/`  
**Purpose:** Page layout components  
**Count:** 11 components

### MarketingLayoutClient

**Type:** Client Component  
**File:** `src/components/layouts/MarketingLayoutClient.tsx`

Client-side marketing layout wrapper.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | ✅ | Page content |

**Use Cases:**
- Layout wrapper
- Marketing pages

**Example:**

```tsx
<MarketingLayoutClient>
  {children}
</MarketingLayoutClient>
```

---

### OfferPageLayout

**Type:** Client Component  
**File:** `src/layouts/OfferPageLayout.tsx`

Layout for individual offer/product pages.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `page` | `object` | ✅ | Page data object |

**Use Cases:**
- Offer detail pages
- Product pages

**Example:**

```tsx
<OfferPageLayout lang="en" page={pageData} />
```

---

### OfferIndexLayout

**Type:** Client Component  
**File:** `src/layouts/OfferIndexLayout.tsx`

Layout for offers listing page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `offers` | `CmsOffer[]` | ✅ | Array of offers |

**Use Cases:**
- Offers listing
- Products listing

**Example:**

```tsx
<OfferIndexLayout lang="en" offers={offers} />
```

---

### ArticleLayout

**Type:** Client Component  
**File:** `src/layouts/ArticleLayout.tsx`

Layout for article/blog post pages.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `article` | `CmsResource` | ✅ | Article data |

**Use Cases:**
- Article pages
- Blog posts

**Example:**

```tsx
<ArticleLayout lang="en" article={articleData} />
```

---

### CaseStudyLayout

**Type:** Client Component  
**File:** `src/layouts/CaseStudyLayout.tsx`

Layout for case study pages.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `caseStudy` | `CmsCase` | ✅ | Case study data |

**Use Cases:**
- Case study pages

**Example:**

```tsx
<CaseStudyLayout lang="en" caseStudy={caseData} />
```

---

### VideoLayout

**Type:** Client Component  
**File:** `src/layouts/VideoLayout.tsx`

Layout for video pages.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `video` | `CmsVideo` | ✅ | Video data |

**Use Cases:**
- Video pages

**Example:**

```tsx
<VideoLayout lang="en" video={videoData} />
```

---

### AboutLayout

**Type:** Client Component  
**File:** `src/layouts/AboutLayout.tsx`

Layout for about page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- About page

**Example:**

```tsx
<AboutLayout lang="en" />
```

---

### ContactLayout

**Type:** Client Component  
**File:** `src/layouts/ContactLayout.tsx`

Layout for contact page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Contact page

**Example:**

```tsx
<ContactLayout lang="en" />
```

---

### LegalLayout

**Type:** Client Component  
**File:** `src/layouts/LegalLayout.tsx`

Layout for legal pages (privacy, terms, etc.).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `content` | `string` | ✅ | Legal content (HTML/markdown) |

**Use Cases:**
- Privacy policy
- Terms of service
- Legal pages

**Example:**

```tsx
<LegalLayout lang="en" content={legalContent} />
```

---

### FAQLayout

**Type:** Client Component  
**File:** `src/layouts/FAQLayout.tsx`

Layout for FAQ page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `faqs` | `CmsFaq[]` | ✅ | Array of FAQ items |

**Use Cases:**
- FAQ page

**Example:**

```tsx
<FAQLayout lang="en" faqs={faqData} />
```

---

### ResourceIndexLayout

**Type:** Client Component  
**File:** `src/layouts/ResourceIndexLayout.tsx`

Layout for resources landing page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- Resources landing

**Example:**

```tsx
<ResourceIndexLayout lang="en" />
```

---

### ResourceCategoryLayout

**Type:** Client Component  
**File:** `src/layouts/ResourceCategoryLayout.tsx`

Layout for resource category pages.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |
| `category` | `string` | ✅ | Category identifier |

**Use Cases:**
- Resource categories

**Example:**

```tsx
<ResourceCategoryLayout lang="en" category="automation" />
```

---

## Icon Components

**Location:** `src/components/icons/`  
**Purpose:** Custom icon components  
**Count:** 1 component

### FriesIcon

**Type:** Server Component  
**File:** `src/components/icons/FriesIcon.tsx`

Custom fries icon (example custom icon).

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `className` | `string` | ❌ | CSS classes |

**Use Cases:**
- Custom branding
- Unique icons

**Example:**

```tsx
<FriesIcon className="h-6 w-6 text-primary" />
```

---

## About Components

**Location:** `src/components/about/`  
**Purpose:** About page components  
**Count:** 1 component

### AboutPageContent

**Type:** Client Component  
**File:** `src/components/about/AboutPageContent.tsx`

Complete about page content.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lang` | `string` | ✅ | Language code |

**Use Cases:**
- About page

**Example:**

```tsx
<AboutPageContent lang="en" />
```

---

## Component Conventions

### Naming

- **PascalCase** for component names
- **File extension**: `.tsx` for all components
- **Props interface**: Named with `Props` suffix (e.g., `SignupHeroProps`)

### Client vs Server Components

**Client Components:**
- Use `"use client"` directive at top of file
- Support interactivity (state, effects, event handlers)
- 62 components in the library

**Server Components:**
- No `"use client"` directive (default)
- Rendered on server only
- 15 components in the library

### Exports

- Use **named exports** for components
- Example: `export function Button() { ... }`

### Styling

- **Tailwind CSS** with design tokens from `src/styles/tokens.css`
- Use token-based classes: `bg-primary`, `text-foreground`, `rounded-md`
- Responsive classes: `sm:`, `md:`, `lg:`, `xl:`

### Internationalization

- Use `next-intl` for translations
- Import: `import { useTranslations } from 'next-intl';`
- Usage: `const t = useTranslations(); t('key')`

### Routing

- Use routes helper from `@/lib/routes`
- Example: `routes.home(lang)`, `routes.offer(lang, slug)`

---

## Common Patterns

### Lang Prop

Most components accept a `lang` prop for internationalization and routing:

```tsx
<Component lang="en" />
```

### CMS Data

Components that display CMS content accept typed CMS objects:

```tsx
<OfferShowcase lang="en" offers={cmsOffers} />
<ArticlesGrid lang="en" articles={cmsArticles} />
```

### Responsive Design

All components use responsive Tailwind classes:

```tsx
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

### Accessibility

Components include:
- ARIA labels
- Semantic HTML
- Keyboard navigation
- Focus states

### Form Validation

Forms use `react-hook-form` with Zod schemas:

```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

### State Management

Client components use React hooks:

```tsx
const [state, setState] = useState(initial);
useEffect(() => { ... }, [deps]);
```

### Error Handling

Forms display validation errors and submission states:

```tsx
{errors.field && <p className="text-red-500">{errors.field.message}</p>}
{isSubmitting && <Loader2 className="animate-spin" />}
```

---

## For AI Agents

### JSON Index

For programmatic access to component metadata, use:

```
docs/components/index.json
```

This file contains:
- Complete component registry
- Props with types
- Use cases and tags
- Code examples
- Component statistics

### Component Discovery

To find components for a specific use case:

1. Check `docs/components/index.json`
2. Filter by `tags` or `useCases`
3. Review `props` for required data
4. Use `example` for implementation

### Creating Sub-Templates

When creating sub-templates:

1. Review component library for available components
2. Select components matching vertical needs
3. Compose pages using layout + content components
4. Customize props and content via CMS
5. Apply theme tokens for branding

### Example AI Workflow

```
1. Query: "Find hero components"
2. Search index.json for tags: ["hero"]
3. Results: SignupHero, DynamicBgSection, StaticBgSection, HelpCentreHero
4. Select based on use case
5. Review props and implement
```

---

## Additional Resources

- **Theme System**: `docs/THEMING_COMPLETE.md`
- **CMS Integration**: `docs/CMS_SCHEMA.md`
- **Factory Cloning**: `docs/FACTORY_CLONING_QUICK_START.md`
- **Component Examples**: `docs/COMPONENT_EXAMPLES.md`

---

**Questions or Issues?**

Refer to the master template documentation index: `docs/MASTER_TEMPLATE_INDEX.md`
