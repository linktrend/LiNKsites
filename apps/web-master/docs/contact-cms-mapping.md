# Contact Page CMS Mapping Documentation

This document provides a complete mapping of all content elements on the Contact page to their CMS fields.

## Page Structure Overview

The Contact page consists of 3 main sections:
1. Hero Section
2. Contact Options Section (with Support Options sub-section)
3. Additional Info Section

---

## SECTION 1: Hero Section

**Section ID:** `contact-hero`  
**CMS Section:** `hero`

### Elements

#### Title
- **CMS Field:** `hero.title`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "Contact Us"

#### Subtitle
- **CMS Field:** `hero.subtitle`
- **Type:** Text
- **Max Length:** ~100 characters
- **Example:** "Get in touch with our team—we're here to help you succeed"

---

## SECTION 2: Contact Options Section

**Section ID:** `contact-options`  
**CMS Section:** `contactOptions`

### Contact Options Cards (3 Cards)

#### Contact Options Collection
- **CMS Collection:** `contactOptions[]`
- **Type:** Array of objects
- **Fixed Items:** 3 (Email, Form, Live Chat)

#### Individual Contact Option Card
Each item in the `contactOptions[]` array contains:

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `contactOptions[i].id` | Number | Unique identifier |
| Icon | `contactOptions[i].icon` | Text/Select | Icon name: "Mail", "FileText", "MessageSquare" |
| Title | `contactOptions[i].title` | Text | Card title (~20 characters) |
| Description | `contactOptions[i].description` | Text | Card description (~60 characters) |
| Link Text | `contactOptions[i].linkText` | Text | Link/button text (~30 characters) |
| Link URL | `contactOptions[i].linkUrl` | URL | Email (mailto:) or action URL |
| Link Type | `contactOptions[i].linkType` | Select | "email", "modal", or "chat" |

**Example Structure:**
```json
{
  "contactOptions": [
    {
      "id": 1,
      "icon": "Mail",
      "title": "Email Us",
      "description": "Send us an email and we'll respond within 24 hours.",
      "linkText": "hello@linktrend.com",
      "linkUrl": "mailto:hello@linktrend.com",
      "linkType": "email"
    },
    {
      "id": 2,
      "icon": "FileText",
      "title": "Fill Out a Form",
      "description": "Send us your details and we'll follow up shortly.",
      "linkText": "Open Form →",
      "linkUrl": "#",
      "linkType": "modal"
    },
    {
      "id": 3,
      "icon": "MessageSquare",
      "title": "Live Chat",
      "description": "Chat with our support team in real-time.",
      "linkText": "Start Chat →",
      "linkUrl": "#",
      "linkType": "chat"
    }
  ]
}
```

### Support Options Cards (2 Cards)

#### Support Options Collection
- **CMS Collection:** `supportOptions[]`
- **Type:** Array of objects
- **Fixed Items:** 2 (Help Centre, Schedule a Call)

#### Individual Support Option Card
Each item in the `supportOptions[]` array contains:

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `supportOptions[i].id` | Number | Unique identifier |
| Icon | `supportOptions[i].icon` | Text/Select | Icon name: "HelpCircle", "Calendar" |
| Title | `supportOptions[i].title` | Text | Card title (~30 characters) |
| Subtitle | `supportOptions[i].subtitle` | Text | Card subtitle (~50 characters) |
| Description | `supportOptions[i].description` | Rich Text | Card description (~150 characters) |
| Button Text | `supportOptions[i].buttonText` | Text | Button label (~20 characters) |
| Button URL | `supportOptions[i].buttonUrl` | URL | Link destination |
| Button Variant | `supportOptions[i].buttonVariant` | Select | "primary" or "outline" |

**Available Icons:**
- `HelpCircle` - Help/Support
- `Calendar` - Scheduling/Appointments

**Example Structure:**
```json
{
  "supportOptions": [
    {
      "id": 1,
      "icon": "HelpCircle",
      "title": "Help Centre",
      "subtitle": "All help information in one place",
      "description": "Access comprehensive guides, tutorials, and FAQs to find answers to your questions. Browse through our knowledge base for step-by-step instructions and best practices.",
      "buttonText": "Help Centre",
      "buttonUrl": "/en/resources/faq",
      "buttonVariant": "primary"
    },
    {
      "id": 2,
      "icon": "Calendar",
      "title": "Schedule a Call",
      "subtitle": "Speak directly with our success team",
      "description": "Pick a time that works for you and we'll connect you with a specialist. Perfect for onboarding, architecture reviews, or billing questions.",
      "buttonText": "Schedule Call",
      "buttonUrl": "#",
      "buttonVariant": "outline"
    }
  ]
}
```

---

## SECTION 3: Additional Info Section

**Section ID:** `additional-info`  
**CMS Section:** `additionalInfo`

### Elements

#### Title
- **CMS Field:** `additionalInfo.title`
- **Type:** Text
- **Max Length:** ~30 characters
- **Example:** "We're Here to Help"

#### Paragraphs
- **CMS Collection:** `additionalInfo.paragraphs[]`
- **Type:** Array of text/rich text
- **Recommended Items:** 2-3 paragraphs

Each paragraph:
- **CMS Field:** `additionalInfo.paragraphs[i]`
- **Type:** Rich Text
- **Max Length:** ~200 characters per paragraph

#### Resources Title
- **CMS Field:** `additionalInfo.resourcesTitle`
- **Type:** Text
- **Max Length:** ~40 characters
- **Example:** "Looking for other resources?"

#### Resource Links
- **CMS Collection:** `additionalInfo.resourceLinks[]`
- **Type:** Array of objects
- **Recommended Items:** 4-6 links

Each resource link:

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `additionalInfo.resourceLinks[i].id` | Number | Unique identifier |
| Label | `additionalInfo.resourceLinks[i].label` | Text | Link text (~30 characters) |
| URL | `additionalInfo.resourceLinks[i].url` | URL | Link destination |

**Example Structure:**
```json
{
  "additionalInfo": {
    "title": "We're Here to Help",
    "paragraphs": [
      "Whether you're a prospective customer, current user, or just curious about what we do, we'd love to hear from you. Our team is dedicated to providing excellent support and answering all your questions.",
      "For urgent technical support issues, existing customers can access our priority support channels through the customer portal. We aim to respond to all inquiries within one business day."
    ],
    "resourcesTitle": "Looking for other resources?",
    "resourceLinks": [
      {
        "id": 1,
        "label": "Articles",
        "url": "/en/resources/articles"
      },
      {
        "id": 2,
        "label": "Case Studies",
        "url": "/en/resources/cases"
      },
      {
        "id": 3,
        "label": "Videos",
        "url": "/en/resources/videos"
      },
      {
        "id": 4,
        "label": "FAQ",
        "url": "/en/resources/faq"
      }
    ]
  }
}
```

---

## Complete CMS Data Structure

```json
{
  "contactPage": {
    "hero": {
      "title": "Contact Us",
      "subtitle": "Get in touch with our team—we're here to help you succeed"
    },
    "contactOptions": [
      {
        "id": 1,
        "icon": "Mail",
        "title": "Email Us",
        "description": "Send us an email and we'll respond within 24 hours.",
        "linkText": "hello@linktrend.com",
        "linkUrl": "mailto:hello@linktrend.com",
        "linkType": "email"
      },
      {
        "id": 2,
        "icon": "FileText",
        "title": "Fill Out a Form",
        "description": "Send us your details and we'll follow up shortly.",
        "linkText": "Open Form →",
        "linkUrl": "#",
        "linkType": "modal"
      },
      {
        "id": 3,
        "icon": "MessageSquare",
        "title": "Live Chat",
        "description": "Chat with our support team in real-time.",
        "linkText": "Start Chat →",
        "linkUrl": "#",
        "linkType": "chat"
      }
    ],
    "supportOptions": [
      {
        "id": 1,
        "icon": "HelpCircle",
        "title": "Help Centre",
        "subtitle": "All help information in one place",
        "description": "Access comprehensive guides, tutorials, and FAQs...",
        "buttonText": "Help Centre",
        "buttonUrl": "/en/resources/faq",
        "buttonVariant": "primary"
      },
      {
        "id": 2,
        "icon": "Calendar",
        "title": "Schedule a Call",
        "subtitle": "Speak directly with our success team",
        "description": "Pick a time that works for you...",
        "buttonText": "Schedule Call",
        "buttonUrl": "#",
        "buttonVariant": "outline"
      }
    ],
    "additionalInfo": {
      "title": "We're Here to Help",
      "paragraphs": [
        "Whether you're a prospective customer...",
        "For urgent technical support issues..."
      ],
      "resourcesTitle": "Looking for other resources?",
      "resourceLinks": [
        {
          "id": 1,
          "label": "Articles",
          "url": "/en/resources/articles"
        },
        {
          "id": 2,
          "label": "Case Studies",
          "url": "/en/resources/cases"
        },
        {
          "id": 3,
          "label": "Videos",
          "url": "/en/resources/videos"
        },
        {
          "id": 4,
          "label": "FAQ",
          "url": "/en/resources/faq"
        }
      ]
    }
  }
}
```

---

## HTML Data Attributes for CMS Integration

All sections, elements, and fields include `data-cms-*` attributes for easy identification:

- `data-cms-section="sectionName"` - Identifies main sections
- `data-cms-element="elementPath"` - Identifies sub-sections and containers
- `data-cms-field="fieldPath"` - Identifies individual editable fields
- `data-cms-collection="collectionName"` - Identifies repeatable collections
- `data-cms-item="itemPath"` - Identifies individual items in collections

### Example Usage in Component:

```tsx
<section id="contact-hero" data-cms-section="hero">
  <h1 data-cms-field="hero.title">{heroData.title}</h1>
  <p data-cms-field="hero.subtitle">{heroData.subtitle}</p>
</section>

<div data-cms-collection="contactOptions">
  {contactOptions.map((option, index) => (
    <div key={option.id} data-cms-item={`contactOptions[${index}]`}>
      <h3 data-cms-field={`contactOptions[${index}].title`}>
        {option.title}
      </h3>
    </div>
  ))}
</div>
```

---

## Key Features

### Contact Options Cards
- **Flex Layout:** Cards use `flex flex-col` with `mt-auto` on link container to push links to bottom
- **Consistent Height:** All cards align properly with links at the bottom
- **Icon Support:** Dynamic icon rendering based on CMS icon name

### Support Options Cards
- **Help Centre Card:** 
  - Uses `HelpCircle` icon
  - Primary button variant (rose-500 background)
  - Links to FAQ/Help Centre page
- **Schedule a Call Card:**
  - Uses `Calendar` icon
  - Outline button variant
  - Can link to scheduling tool

### Resource Links
- **Dynamic Links:** All links point to specific resource types
- **Consistent Format:** All links include arrow (→) for visual consistency
- **Easy Updates:** Links can be added/removed via CMS

---

## Spacing Adjustments

### Section Spacing (Reduced as requested):
1. **Hero to Contact Options:** `pt-8 sm:pt-12` (reduced from `pt-12 sm:pt-16`)
2. **Contact Options to Additional Info:** `pt-8 sm:pt-12` (reduced from `pt-12 sm:pt-16`)
3. **Hero Bottom Padding:** `pb-8 sm:pb-12` (reduced from `pb-12 sm:pb-16`)

---

## Integration Notes

1. **Email Links:** Use `mailto:` protocol for email addresses
2. **Modal Triggers:** `linkType: "modal"` opens contact form modal
3. **Chat Triggers:** `linkType: "chat"` can trigger chat widget
4. **Button Variants:** "primary" uses rose-500, "outline" uses default outline style
5. **Icons:** Icon names must match exactly (case-sensitive)
6. **Resource Links:** Should point to actual resource pages in the site

---

## Testing Checklist

- [ ] Hero title and subtitle display correctly
- [ ] All 3 contact option cards display with icons
- [ ] Email link opens email client
- [ ] Form button opens contact modal
- [ ] Live Chat link positioned at bottom of card
- [ ] Help Centre card displays with HelpCircle icon
- [ ] Help Centre button links to FAQ page
- [ ] Schedule a Call card displays correctly
- [ ] Additional info paragraphs render properly
- [ ] Resource links point to correct pages
- [ ] All content is editable via CMS
- [ ] Mobile responsive layout works correctly
- [ ] Spacing between sections is reduced as specified






