# Home Page CMS Mapping Documentation

This document provides a complete mapping of all content elements on the Home page to their CMS fields.

## Page Structure Overview

The Home page consists of 3 main sections:
1. Hero Section (with Social Proof Carousel and Signup Form)
2. Platform & Pricing Section
3. CTA & Solutions Section

---

## SECTION 1: Hero Section

**Section ID:** `home-hero`  
**CMS Section:** `hero`

This section includes a dynamic background image, social proof carousel, and signup form.

### Background Image

#### Background Image URL
- **CMS Field:** `hero.backgroundImage`
- **Type:** Image URL
- **Recommended Size:** 1920x1080px
- **Format:** JPG, PNG, or WebP
- **Example:** "https://example.com/hero-bg.jpg"
- **Note:** Currently uses random Picsum image; replace with CMS-controlled image

---

### Social Proof Carousel

**Sub-section ID:** `social-proof-carousel`  
**CMS Collection:** `hero.socialProof[]`

#### Carousel Items Collection
- **CMS Collection:** `hero.socialProof[]`
- **Type:** Array of objects
- **Recommended Items:** 3-6 items
- **Auto-rotate:** Every 5 seconds

#### Individual Carousel Item

Each item can be either a **Testimonial** or a **Media Mention**:

##### Testimonial Type

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `hero.socialProof[i].id` | Number | Unique identifier |
| Type | `hero.socialProof[i].type` | Select | "testimonial" |
| Quote | `hero.socialProof[i].quote` | Text | Customer quote (~150 characters) |
| Author | `hero.socialProof[i].author` | Text | Person's name (~30 characters) |
| Title | `hero.socialProof[i].title` | Text | Job title and company (~50 characters) |

##### Media Mention Type

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `hero.socialProof[i].id` | Number | Unique identifier |
| Type | `hero.socialProof[i].type` | Select | "media" |
| Publication | `hero.socialProof[i].publication` | Text | Media outlet name (~30 characters) |
| Quote | `hero.socialProof[i].quote` | Text | Featured quote or award (~80 characters) |

**Example Structure:**
```json
{
  "hero": {
    "backgroundImage": "https://example.com/hero-bg.jpg",
    "socialProof": [
      {
        "id": 1,
        "type": "testimonial",
        "quote": "LinkTrend helps our operations team automate reporting in hours instead of weeks.",
        "author": "Morgan Patel",
        "title": "COO, Northwind Labs"
      },
      {
        "id": 2,
        "type": "media",
        "publication": "Future of Work",
        "quote": "Top pick for AI-first automation platforms in 2025."
      },
      {
        "id": 3,
        "type": "testimonial",
        "quote": "The insights dashboard gives our executives a single source of truth for revenue planning.",
        "author": "Jade Ramirez",
        "title": "VP Finance, Aurora Systems"
      },
      {
        "id": 4,
        "type": "media",
        "publication": "Product Hunt",
        "quote": "#1 Product of the Day"
      }
    ]
  }
}
```

---

### Signup Form

**Sub-section ID:** `signup-form`  
**CMS Section:** `hero.signupForm`

#### Form Header

##### Title
- **CMS Field:** `hero.signupForm.title`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "Free Sign Up"

##### Subtitle
- **CMS Field:** `hero.signupForm.subtitle`
- **Type:** Text
- **Max Length:** ~60 characters
- **Example:** "Connect in seconds—no credit card required."

#### OAuth Providers

##### Providers Collection
- **CMS Collection:** `hero.signupForm.oauthProviders[]`
- **Type:** Array of strings
- **Fixed Items:** 3 providers
- **Options:** "Google", "Apple", "Microsoft", "Facebook", "GitHub"

**Example:**
```json
{
  "oauthProviders": ["Google", "Apple", "Microsoft"]
}
```

#### Divider Text
- **CMS Field:** `hero.signupForm.dividerText`
- **Type:** Text
- **Max Length:** ~10 characters
- **Example:** "OR"

#### Form Fields

##### Email Field Label
- **CMS Field:** `hero.signupForm.emailLabel`
- **Type:** Text
- **Max Length:** ~20 characters
- **Example:** "Email"

##### Email Field Placeholder
- **CMS Field:** `hero.signupForm.emailPlaceholder`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "you@example.com"

##### Phone Field Label
- **CMS Field:** `hero.signupForm.phoneLabel`
- **Type:** Text
- **Max Length:** ~20 characters
- **Example:** "Phone"

##### Phone Field Placeholder
- **CMS Field:** `hero.signupForm.phonePlaceholder`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "+1 (555) 000-0000"

#### Terms & Conditions

##### Terms Text (Before Links)
- **CMS Field:** `hero.signupForm.termsTextBefore`
- **Type:** Text
- **Max Length:** ~50 characters
- **Example:** "By continuing, you accept our"

##### Privacy Policy Link Text
- **CMS Field:** `hero.signupForm.privacyLinkText`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "Privacy Policy"

##### Privacy Policy URL
- **CMS Field:** `hero.signupForm.privacyLinkUrl`
- **Type:** URL
- **Example:** "/legal/privacy-policy"

##### Terms Text (Between Links)
- **CMS Field:** `hero.signupForm.termsTextMiddle`
- **Type:** Text
- **Max Length:** ~10 characters
- **Example:** "and"

##### Terms of Use Link Text
- **CMS Field:** `hero.signupForm.termsLinkText`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "Terms of Use"

##### Terms of Use URL
- **CMS Field:** `hero.signupForm.termsLinkUrl`
- **Type:** URL
- **Example:** "/legal/terms-of-use"

#### Submit Button

##### Button Text
- **CMS Field:** `hero.signupForm.submitButtonText`
- **Type:** Text
- **Max Length:** ~20 characters
- **Example:** "Get Started"

##### Button URL
- **CMS Field:** `hero.signupForm.submitButtonUrl`
- **Type:** URL
- **Example:** "/contact"

---

### Scroll Indicator

**Sub-section ID:** `scroll-indicator`  
**CMS Section:** `hero.scrollIndicator`

#### Scroll Text
- **CMS Field:** `hero.scrollIndicator.text`
- **Type:** Text
- **Max Length:** ~20 characters
- **Example:** "Explore more"

#### Target Section ID
- **CMS Field:** `hero.scrollIndicator.targetId`
- **Type:** Text
- **Example:** "linktrend-platform"
- **Note:** ID of section to scroll to

---

## SECTION 2: Platform & Pricing Section

**Section ID:** `linktrend-platform`  
**CMS Section:** `platformPricing`

This section is split into two columns: Platform Features (left) and Pricing Preview (right).

---

### Platform Features (Left Column)

**Sub-section ID:** `platform-features`  
**CMS Section:** `platformPricing.features`

#### Section Header

##### Title
- **CMS Field:** `platformPricing.features.title`
- **Type:** Text
- **Max Length:** ~40 characters
- **Example:** "Platform built for scale"

##### Subtitle
- **CMS Field:** `platformPricing.features.subtitle`
- **Type:** Text
- **Max Length:** ~100 characters
- **Example:** "Everything you need to orchestrate automations across the business."

#### Feature Cards Collection

- **CMS Collection:** `platformPricing.features.cards[]`
- **Type:** Array of objects
- **Recommended Items:** 4 cards (2x2 grid)

##### Individual Feature Card

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `platformPricing.features.cards[i].id` | Number | Unique identifier |
| Icon | `platformPricing.features.cards[i].icon` | Select | Icon name (see available icons below) |
| Title | `platformPricing.features.cards[i].title` | Text | Card title (~40 characters) |
| Description | `platformPricing.features.cards[i].description` | Text | Card description (~150 characters) |
| Link Text | `platformPricing.features.cards[i].linkText` | Text | Link text (~20 characters) |
| Link URL | `platformPricing.features.cards[i].linkUrl` | URL | Link destination |

**Available Icons:**
- `Zap` - Lightning/Speed
- `TrendingUp` - Growth/Analytics
- `Sparkles` - AI/Magic
- `HeadphonesIcon` - Support/Service
- `Shield` - Security
- `Users` - Team/Collaboration
- `Settings` - Configuration
- `Database` - Data/Storage

**Example Structure:**
```json
{
  "platformPricing": {
    "features": {
      "title": "Platform built for scale",
      "subtitle": "Everything you need to orchestrate automations across the business.",
      "cards": [
        {
          "id": 1,
          "icon": "Zap",
          "title": "Lightning Fast Performance",
          "description": "Stream data from every system and respond to signals in seconds with LinkTrend's real-time fabric.",
          "linkText": "Learn more",
          "linkUrl": "/offers/ai-automation"
        },
        {
          "id": 2,
          "icon": "TrendingUp",
          "title": "Scale with Confidence",
          "description": "Move from a pilot to thousands of automations without replatforming or rewriting workflows.",
          "linkText": "Learn more",
          "linkUrl": "/offers/data-insights"
        },
        {
          "id": 3,
          "icon": "Sparkles",
          "title": "AI-Powered Intelligence",
          "description": "Blend predictive insights with human-in-the-loop controls for more reliable decisioning.",
          "linkText": "Learn more",
          "linkUrl": "/resources/articles"
        },
        {
          "id": 4,
          "icon": "HeadphonesIcon",
          "title": "Innovation & Support",
          "description": "Our specialists act as an extension of your ops team with onboarding, templates, and 24/7 support.",
          "linkText": "Learn more",
          "linkUrl": "/contact"
        }
      ]
    }
  }
}
```

---

### Pricing Preview (Right Column)

**Sub-section ID:** `pricing-preview`  
**CMS Section:** `platformPricing.pricing`

#### Section Header

##### Title
- **CMS Field:** `platformPricing.pricing.title`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "Simple Pricing"

##### Subtitle
- **CMS Field:** `platformPricing.pricing.subtitle`
- **Type:** Text
- **Max Length:** ~80 characters
- **Example:** "Choose the plan that fits your automation journey."

#### Billing Toggle

##### Monthly Label
- **CMS Field:** `platformPricing.pricing.monthlyLabel`
- **Type:** Text
- **Max Length:** ~15 characters
- **Example:** "Monthly"

##### Yearly Label
- **CMS Field:** `platformPricing.pricing.yearlyLabel`
- **Type:** Text
- **Max Length:** ~15 characters
- **Example:** "Yearly"

##### Default Selection
- **CMS Field:** `platformPricing.pricing.defaultBilling`
- **Type:** Select
- **Options:** "monthly" or "yearly"
- **Example:** "yearly"

#### Pricing Tiers Collection

- **CMS Collection:** `platformPricing.pricing.tiers[]`
- **Type:** Array of objects
- **Recommended Items:** 3 tiers

##### Individual Pricing Tier

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `platformPricing.pricing.tiers[i].id` | Number | Unique identifier |
| Name | `platformPricing.pricing.tiers[i].name` | Text | Tier name (~20 characters) |
| Description | `platformPricing.pricing.tiers[i].description` | Text | Tier description (~80 characters) |
| Monthly Price | `platformPricing.pricing.tiers[i].monthlyPrice` | Text | Price per month (e.g., "$29" or "Custom") |
| Yearly Price | `platformPricing.pricing.tiers[i].yearlyPrice` | Text | Price per year (e.g., "$290" or "Custom") |
| Button Text | `platformPricing.pricing.tiers[i].buttonText` | Text | CTA button text (~20 characters) |
| Button URL | `platformPricing.pricing.tiers[i].buttonUrl` | URL | Link destination |
| Highlighted | `platformPricing.pricing.tiers[i].highlighted` | Boolean | Whether to highlight this tier |
| Features | `platformPricing.pricing.tiers[i].features[]` | Array of strings | List of features (3-5 items) |

**Example Structure:**
```json
{
  "platformPricing": {
    "pricing": {
      "title": "Simple Pricing",
      "subtitle": "Choose the plan that fits your automation journey.",
      "monthlyLabel": "Monthly",
      "yearlyLabel": "Yearly",
      "defaultBilling": "yearly",
      "tiers": [
        {
          "id": 1,
          "name": "Free",
          "description": "Perfect for pilots and proof of value.",
          "monthlyPrice": "$0",
          "yearlyPrice": "$0",
          "buttonText": "Talk to us",
          "buttonUrl": "/contact",
          "highlighted": false,
          "features": [
            "2 automations",
            "Community support"
          ]
        },
        {
          "id": 2,
          "name": "Pro",
          "description": "Best for teams operationalizing AI-driven workflows.",
          "monthlyPrice": "$29",
          "yearlyPrice": "$290",
          "buttonText": "Talk to us",
          "buttonUrl": "/contact",
          "highlighted": true,
          "features": [
            "Unlimited automations",
            "Priority support",
            "100GB secure storage",
            "Advanced insights"
          ]
        },
        {
          "id": 3,
          "name": "Enterprise",
          "description": "For regulated industries and global deployments.",
          "monthlyPrice": "Custom",
          "yearlyPrice": "Custom",
          "buttonText": "Talk to us",
          "buttonUrl": "/contact",
          "highlighted": false,
          "features": [
            "Dedicated advisor",
            "Private cloud options"
          ]
        }
      ]
    }
  }
}
```

#### Scroll Controls

##### Scroll Label
- **CMS Field:** `platformPricing.pricing.scrollLabel`
- **Type:** Text
- **Max Length:** ~15 characters
- **Example:** "Scroll"

#### Footer Link

##### Footer Link Text
- **CMS Field:** `platformPricing.pricing.footerLinkText`
- **Type:** Text
- **Max Length:** ~40 characters
- **Example:** "View detailed pricing →"

##### Footer Link URL
- **CMS Field:** `platformPricing.pricing.footerLinkUrl`
- **Type:** URL
- **Example:** "/resources/faq"

---

## SECTION 3: CTA & Solutions Section

**Section ID:** `cta-solutions`  
**CMS Section:** `ctaSolutions`

This section is split into two columns: CTA Section (left) and Solutions Overview (right).

---

### CTA Section (Left Column)

**Sub-section ID:** `cta-section`  
**CMS Section:** `ctaSolutions.cta`

#### Section Header

##### Title
- **CMS Field:** `ctaSolutions.cta.title`
- **Type:** Text
- **Max Length:** ~40 characters
- **Example:** "Ready to get started?"

##### Description
- **CMS Field:** `ctaSolutions.cta.description`
- **Type:** Text
- **Max Length:** ~120 characters
- **Example:** "Join teams already using LinkTrend to orchestrate AI-first insights and automation."

#### CTA Button

##### Button Text
- **CMS Field:** `ctaSolutions.cta.buttonText`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "Get started free"

##### Button URL
- **CMS Field:** `ctaSolutions.cta.buttonUrl`
- **Type:** URL
- **Example:** "/contact"

#### Trust Indicators

- **CMS Collection:** `ctaSolutions.cta.trustIndicators[]`
- **Type:** Array of strings
- **Recommended Items:** 3-4 items
- **Max Length per Item:** ~50 characters

**Example:**
```json
{
  "ctaSolutions": {
    "cta": {
      "title": "Ready to get started?",
      "description": "Join teams already using LinkTrend to orchestrate AI-first insights and automation.",
      "buttonText": "Get started free",
      "buttonUrl": "/contact",
      "trustIndicators": [
        "No credit card required",
        "Free automation templates",
        "Cancel anytime"
      ]
    }
  }
}
```

---

### Solutions Overview (Right Column)

**Sub-section ID:** `solutions-overview`  
**CMS Section:** `ctaSolutions.solutions`

#### Section Header

##### Title
- **CMS Field:** `ctaSolutions.solutions.title`
- **Type:** Text
- **Max Length:** ~40 characters
- **Example:** "Solutions for every team"

##### Subtitle
- **CMS Field:** `ctaSolutions.solutions.subtitle`
- **Type:** Text
- **Max Length:** ~100 characters
- **Example:** "Discover how LinkTrend adapts to your operating model."

#### Solution Cards Collection

- **CMS Collection:** `ctaSolutions.solutions.cards[]`
- **Type:** Array of objects
- **Recommended Items:** 4 cards (2x2 grid)

##### Individual Solution Card

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `ctaSolutions.solutions.cards[i].id` | Number | Unique identifier |
| Icon | `ctaSolutions.solutions.cards[i].icon` | Select | Icon name (see available icons below) |
| Title | `ctaSolutions.solutions.cards[i].title` | Text | Card title (~30 characters) |
| Description | `ctaSolutions.solutions.cards[i].description` | Text | Card description (~150 characters) |
| Link Text | `ctaSolutions.solutions.cards[i].linkText` | Text | Link text (~20 characters) |
| Link URL | `ctaSolutions.solutions.cards[i].linkUrl` | URL | Link destination |

**Available Icons:**
- `Users` - Team/People
- `Building2` - Company/Industry
- `TrendingUp` - Growth/Scale
- `UserCheck` - Role/Permission
- `Briefcase` - Business
- `Target` - Goals/Objectives

**Example Structure:**
```json
{
  "ctaSolutions": {
    "solutions": {
      "title": "Solutions for every team",
      "subtitle": "Discover how LinkTrend adapts to your operating model.",
      "cards": [
        {
          "id": 1,
          "icon": "Users",
          "title": "For Operations",
          "description": "Automate approvals, escalations, and reporting with LinkTrend playbooks tailored for ops leaders.",
          "linkText": "Explore",
          "linkUrl": "/offers/ai-automation"
        },
        {
          "id": 2,
          "icon": "Building2",
          "title": "By Industry",
          "description": "Prebuilt accelerators for financial services, retail, and logistics with governance baked in.",
          "linkText": "Explore",
          "linkUrl": "/resources/cases"
        },
        {
          "id": 3,
          "icon": "TrendingUp",
          "title": "By Company Size",
          "description": "Start fast as a startup and scale to enterprise volumes without migrating your data estate.",
          "linkText": "Explore",
          "linkUrl": "/resources/articles"
        },
        {
          "id": 4,
          "icon": "UserCheck",
          "title": "By Role",
          "description": "Purpose-built dashboards for executives, analysts, and builders—everyone sees what they need.",
          "linkText": "Explore",
          "linkUrl": "/resources/videos"
        }
      ]
    }
  }
}
```

---

## Complete CMS Data Structure

```json
{
  "homePage": {
    "hero": {
      "backgroundImage": "https://example.com/hero-bg.jpg",
      "socialProof": [
        {
          "id": 1,
          "type": "testimonial",
          "quote": "LinkTrend helps our operations team automate reporting in hours instead of weeks.",
          "author": "Morgan Patel",
          "title": "COO, Northwind Labs"
        },
        {
          "id": 2,
          "type": "media",
          "publication": "Future of Work",
          "quote": "Top pick for AI-first automation platforms in 2025."
        },
        {
          "id": 3,
          "type": "testimonial",
          "quote": "The insights dashboard gives our executives a single source of truth for revenue planning.",
          "author": "Jade Ramirez",
          "title": "VP Finance, Aurora Systems"
        },
        {
          "id": 4,
          "type": "media",
          "publication": "Product Hunt",
          "quote": "#1 Product of the Day"
        }
      ],
      "signupForm": {
        "title": "Free Sign Up",
        "subtitle": "Connect in seconds—no credit card required.",
        "oauthProviders": ["Google", "Apple", "Microsoft"],
        "dividerText": "OR",
        "emailLabel": "Email",
        "emailPlaceholder": "you@example.com",
        "phoneLabel": "Phone",
        "phonePlaceholder": "+1 (555) 000-0000",
        "termsTextBefore": "By continuing, you accept our",
        "privacyLinkText": "Privacy Policy",
        "privacyLinkUrl": "/legal/privacy-policy",
        "termsTextMiddle": "and",
        "termsLinkText": "Terms of Use",
        "termsLinkUrl": "/legal/terms-of-use",
        "submitButtonText": "Get Started",
        "submitButtonUrl": "/contact"
      },
      "scrollIndicator": {
        "text": "Explore more",
        "targetId": "linktrend-platform"
      }
    },
    "platformPricing": {
      "features": {
        "title": "Platform built for scale",
        "subtitle": "Everything you need to orchestrate automations across the business.",
        "cards": [
          {
            "id": 1,
            "icon": "Zap",
            "title": "Lightning Fast Performance",
            "description": "Stream data from every system and respond to signals in seconds with LinkTrend's real-time fabric.",
            "linkText": "Learn more",
            "linkUrl": "/offers/ai-automation"
          },
          {
            "id": 2,
            "icon": "TrendingUp",
            "title": "Scale with Confidence",
            "description": "Move from a pilot to thousands of automations without replatforming or rewriting workflows.",
            "linkText": "Learn more",
            "linkUrl": "/offers/data-insights"
          },
          {
            "id": 3,
            "icon": "Sparkles",
            "title": "AI-Powered Intelligence",
            "description": "Blend predictive insights with human-in-the-loop controls for more reliable decisioning.",
            "linkText": "Learn more",
            "linkUrl": "/resources/articles"
          },
          {
            "id": 4,
            "icon": "HeadphonesIcon",
            "title": "Innovation & Support",
            "description": "Our specialists act as an extension of your ops team with onboarding, templates, and 24/7 support.",
            "linkText": "Learn more",
            "linkUrl": "/contact"
          }
        ]
      },
      "pricing": {
        "title": "Simple Pricing",
        "subtitle": "Choose the plan that fits your automation journey.",
        "monthlyLabel": "Monthly",
        "yearlyLabel": "Yearly",
        "defaultBilling": "yearly",
        "scrollLabel": "Scroll",
        "footerLinkText": "View detailed pricing →",
        "footerLinkUrl": "/resources/faq",
        "tiers": [
          {
            "id": 1,
            "name": "Free",
            "description": "Perfect for pilots and proof of value.",
            "monthlyPrice": "$0",
            "yearlyPrice": "$0",
            "buttonText": "Talk to us",
            "buttonUrl": "/contact",
            "highlighted": false,
            "features": [
              "2 automations",
              "Community support"
            ]
          },
          {
            "id": 2,
            "name": "Pro",
            "description": "Best for teams operationalizing AI-driven workflows.",
            "monthlyPrice": "$29",
            "yearlyPrice": "$290",
            "buttonText": "Talk to us",
            "buttonUrl": "/contact",
            "highlighted": true,
            "features": [
              "Unlimited automations",
              "Priority support",
              "100GB secure storage",
              "Advanced insights"
            ]
          },
          {
            "id": 3,
            "name": "Enterprise",
            "description": "For regulated industries and global deployments.",
            "monthlyPrice": "Custom",
            "yearlyPrice": "Custom",
            "buttonText": "Talk to us",
            "buttonUrl": "/contact",
            "highlighted": false,
            "features": [
              "Dedicated advisor",
              "Private cloud options"
            ]
          }
        ]
      }
    },
    "ctaSolutions": {
      "cta": {
        "title": "Ready to get started?",
        "description": "Join teams already using LinkTrend to orchestrate AI-first insights and automation.",
        "buttonText": "Get started free",
        "buttonUrl": "/contact",
        "trustIndicators": [
          "No credit card required",
          "Free automation templates",
          "Cancel anytime"
        ]
      },
      "solutions": {
        "title": "Solutions for every team",
        "subtitle": "Discover how LinkTrend adapts to your operating model.",
        "cards": [
          {
            "id": 1,
            "icon": "Users",
            "title": "For Operations",
            "description": "Automate approvals, escalations, and reporting with LinkTrend playbooks tailored for ops leaders.",
            "linkText": "Explore",
            "linkUrl": "/offers/ai-automation"
          },
          {
            "id": 2,
            "icon": "Building2",
            "title": "By Industry",
            "description": "Prebuilt accelerators for financial services, retail, and logistics with governance baked in.",
            "linkText": "Explore",
            "linkUrl": "/resources/cases"
          },
          {
            "id": 3,
            "icon": "TrendingUp",
            "title": "By Company Size",
            "description": "Start fast as a startup and scale to enterprise volumes without migrating your data estate.",
            "linkText": "Explore",
            "linkUrl": "/resources/articles"
          },
          {
            "id": 4,
            "icon": "UserCheck",
            "title": "By Role",
            "description": "Purpose-built dashboards for executives, analysts, and builders—everyone sees what they need.",
            "linkText": "Explore",
            "linkUrl": "/resources/videos"
          }
        ]
      }
    }
  }
}
```

---

## HTML Data Attributes for CMS Integration

All sections, elements, and fields should include `data-cms-*` attributes for easy identification:

- `data-cms-section="sectionName"` - Identifies main sections
- `data-cms-element="elementPath"` - Identifies sub-sections and containers
- `data-cms-field="fieldPath"` - Identifies individual editable fields
- `data-cms-collection="collectionName"` - Identifies repeatable collections
- `data-cms-item="itemPath"` - Identifies individual items in collections

### Example Usage in Components:

#### Hero Section with Social Proof
```tsx
<section id="home-hero" data-cms-section="hero">
  <div data-cms-element="hero.socialProof">
    {socialProofItems.map((item, index) => (
      <div key={item.id} data-cms-item={`hero.socialProof[${index}]`}>
        {item.type === "testimonial" ? (
          <>
            <p data-cms-field={`hero.socialProof[${index}].quote`}>
              {item.quote}
            </p>
            <p data-cms-field={`hero.socialProof[${index}].author`}>
              {item.author}
            </p>
            <p data-cms-field={`hero.socialProof[${index}].title`}>
              {item.title}
            </p>
          </>
        ) : (
          <>
            <span data-cms-field={`hero.socialProof[${index}].publication`}>
              {item.publication}
            </span>
            <p data-cms-field={`hero.socialProof[${index}].quote`}>
              {item.quote}
            </p>
          </>
        )}
      </div>
    ))}
  </div>
</section>
```

#### Platform Features
```tsx
<div data-cms-section="platformPricing.features">
  <h2 data-cms-field="platformPricing.features.title">
    {featuresData.title}
  </h2>
  <p data-cms-field="platformPricing.features.subtitle">
    {featuresData.subtitle}
  </p>
  <div data-cms-collection="platformPricing.features.cards">
    {featureCards.map((card, index) => (
      <div key={card.id} data-cms-item={`platformPricing.features.cards[${index}]`}>
        <h3 data-cms-field={`platformPricing.features.cards[${index}].title`}>
          {card.title}
        </h3>
        <p data-cms-field={`platformPricing.features.cards[${index}].description`}>
          {card.description}
        </p>
      </div>
    ))}
  </div>
</div>
```

---

## Key Features & Implementation Notes

### Hero Section
- **Dynamic Background:** Background image should be CMS-controlled for seasonal/campaign updates
- **Carousel Auto-rotation:** 5-second intervals with manual navigation dots
- **Responsive Layout:** Stacks vertically on mobile, side-by-side on desktop
- **Form Validation:** Email OR phone required, terms acceptance required

### Social Proof Carousel
- **Two Content Types:** Testimonials (with author attribution) and Media Mentions (with publication badge)
- **Visual Differentiation:** Testimonials show quote icon, media mentions show badge
- **Navigation:** Automatic rotation + manual dot navigation

### Signup Form
- **OAuth Integration:** Supports multiple OAuth providers (configurable via CMS)
- **Flexible Requirements:** Email OR phone (not both required)
- **Legal Compliance:** Terms acceptance with links to legal pages
- **Responsive Design:** Touch-friendly targets on mobile

### Platform Features
- **Icon System:** Uses Lucide React icons (must match exact names)
- **Grid Layout:** 2x2 grid on desktop, single column on mobile
- **Card Hover:** Border color and shadow change on hover
- **Consistent Heights:** All cards stretch to match tallest card in row

### Pricing Preview
- **Billing Toggle:** Switch between monthly/yearly pricing
- **Scrollable Container:** Height matches Platform Features section
- **Scroll Controls:** Up/down buttons with disabled states
- **Highlighted Tier:** Visual emphasis on recommended plan (typically Pro)
- **Custom Pricing:** Supports "Custom" text for Enterprise pricing

### CTA Section
- **Trust Indicators:** Checkmark icons with key selling points
- **Gradient Background:** Subtle gradient from primary color
- **Prominent Button:** Large, high-contrast CTA button

### Solutions Overview
- **Icon System:** Uses Lucide React icons for visual categorization
- **Grid Layout:** 2x2 grid on desktop, single column on mobile
- **Card Hover:** Border and shadow effects on hover
- **Explore Links:** All cards link to relevant solution pages

---

## Spacing & Layout

### Section Spacing
1. **Hero Section:** Full viewport height with padding
2. **Platform & Pricing Section:** `pt-12 sm:pt-16 pb-8 sm:pb-12`
3. **CTA & Solutions Section:** `pt-8 sm:pt-12 pb-6 sm:pb-8`

### Container Spacing
- **Container Max Width:** Responsive container with `px-4 sm:px-6`
- **Grid Gaps:** `gap-8 sm:gap-10` for major sections
- **Card Gaps:** `gap-6` for card grids

---

## Responsive Breakpoints

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (sm to lg)
- **Desktop:** > 1024px (lg+)

### Layout Changes by Breakpoint

#### Mobile (< 640px)
- Single column layout for all sections
- Signup form on top, carousel below
- Stacked cards (no grid)
- Larger touch targets (44px minimum)

#### Tablet (640px - 1024px)
- 2-column grid for feature/solution cards
- Side-by-side hero layout
- Reduced padding and gaps

#### Desktop (> 1024px)
- 3-column layout for hero section
- 2x2 grids for feature/solution cards
- Full spacing and padding

---

## Integration Checklist

### Hero Section
- [ ] Background image loads from CMS
- [ ] Social proof carousel auto-rotates
- [ ] Carousel manual navigation works
- [ ] All testimonials display correctly
- [ ] Media mentions show badge styling
- [ ] Signup form OAuth buttons render
- [ ] Form validation works (email OR phone)
- [ ] Terms links point to correct pages
- [ ] Submit button redirects correctly
- [ ] Scroll indicator scrolls to next section

### Platform & Pricing Section
- [ ] Platform features title/subtitle display
- [ ] All 4 feature cards render
- [ ] Feature icons display correctly
- [ ] Feature links work
- [ ] Pricing title/subtitle display
- [ ] Billing toggle switches pricing
- [ ] All 3 pricing tiers display
- [ ] Highlighted tier has visual emphasis
- [ ] Pricing features list correctly
- [ ] Scroll controls work (up/down)
- [ ] Footer link displays and works
- [ ] Heights match between columns

### CTA & Solutions Section
- [ ] CTA title/description display
- [ ] CTA button works
- [ ] Trust indicators display with checkmarks
- [ ] Solutions title/subtitle display
- [ ] All 4 solution cards render
- [ ] Solution icons display correctly
- [ ] Solution links work
- [ ] Card hover effects work

### Responsive Design
- [ ] Mobile layout stacks correctly
- [ ] Touch targets are 44px minimum on mobile
- [ ] Tablet layout uses appropriate grid
- [ ] Desktop layout shows full 3-column hero
- [ ] All breakpoints tested

### Performance
- [ ] Images optimized and lazy-loaded
- [ ] Carousel transitions smooth
- [ ] No layout shift on load
- [ ] Fast interaction response

---

## Content Guidelines

### Writing Style
- **Headlines:** Bold, benefit-focused, action-oriented
- **Descriptions:** Clear, concise, jargon-free
- **CTAs:** Action verbs, urgency, value proposition
- **Testimonials:** Specific results, authentic voice
- **Features:** Problem → Solution format

### Character Limits (Recommended)
- **Page Title (SEO):** 50-60 characters
- **Meta Description:** 150-160 characters
- **Section Headlines:** 30-40 characters
- **Card Titles:** 20-30 characters
- **Card Descriptions:** 120-150 characters
- **Button Text:** 15-25 characters
- **Testimonial Quotes:** 120-150 characters
- **Author Names:** 20-30 characters
- **Job Titles:** 40-50 characters

### Image Requirements
- **Hero Background:** 1920x1080px, optimized for web
- **Format:** WebP with JPG fallback
- **File Size:** < 200KB after optimization
- **Alt Text:** Descriptive, keyword-rich

---

## SEO Considerations

### Meta Tags (from CMS)
- **Title:** "LinkTrend - AI-First Automation Platform"
- **Description:** "Orchestrate AI-driven insights and automation across your business. Start free with LinkTrend's enterprise-grade platform."
- **Keywords:** automation, AI, platform, workflow, enterprise
- **OG Image:** Hero background or branded image

### Structured Data
- **Organization Schema:** Company info
- **Product Schema:** Platform features and pricing
- **Review Schema:** Testimonials and ratings

### Internal Linking
- All cards and CTAs link to relevant internal pages
- Consistent URL structure with language prefix
- Descriptive anchor text

---

## Accessibility (A11Y)

### ARIA Labels
- Carousel navigation: `aria-label="Show slide {n}"`
- Form fields: Proper `<label>` associations
- Buttons: Descriptive text or `aria-label`
- Icons: `aria-hidden="true"` with text labels

### Keyboard Navigation
- All interactive elements keyboard-accessible
- Tab order follows visual flow
- Focus indicators visible
- Skip links for main content

### Screen Readers
- Semantic HTML structure
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all images
- Form field labels and error messages

---

## Testing Scenarios

### Functional Testing
1. Load home page and verify all sections render
2. Test carousel auto-rotation (5 seconds)
3. Click carousel dots to manually navigate
4. Fill signup form with email only → should enable submit
5. Fill signup form with phone only → should enable submit
6. Try to submit without accepting terms → should be disabled
7. Toggle pricing monthly/yearly → prices update
8. Scroll pricing cards up/down → controls enable/disable
9. Click all feature card links → navigate correctly
10. Click all solution card links → navigate correctly
11. Click CTA button → navigates to contact page
12. Test scroll indicator → scrolls to platform section

### Responsive Testing
1. Test on mobile (< 640px) → single column layout
2. Test on tablet (640-1024px) → 2-column grids
3. Test on desktop (> 1024px) → full 3-column hero
4. Test touch targets on mobile → minimum 44px
5. Test landscape orientation on mobile

### Performance Testing
1. Measure page load time → target < 3 seconds
2. Check Lighthouse score → target > 90
3. Test on slow 3G connection
4. Verify images lazy-load
5. Check for layout shift (CLS)

### Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## Maintenance & Updates

### Regular Updates (Monthly)
- Update testimonials with new customer quotes
- Rotate media mentions with recent press
- Update pricing if plans change
- Refresh hero background image seasonally

### Quarterly Reviews
- Review analytics for section engagement
- A/B test CTA button text
- Update feature descriptions based on product changes
- Refresh solution card links if offerings change

### Annual Audits
- Full content audit for accuracy
- SEO keyword optimization
- Accessibility compliance check
- Performance optimization review

---

## Version History

- **v1.0** - Initial home page CMS mapping (Nov 2025)






