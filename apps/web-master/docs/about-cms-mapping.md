# About Page CMS Mapping Documentation

This document provides a complete mapping of all content elements on the About page to their CMS fields.

## Page Structure Overview

The About page consists of 5 main sections:
1. Hero Section
2. Product Carousel Section
3. Products & Services Section
4. Values Section
5. CTA Section

---

## SECTION 1: Hero Section

**Section ID:** `about-hero`  
**CMS Section:** `hero`

### Elements

#### Background Image
- **CMS Field:** `hero.backgroundImage`
- **Type:** Image URL
- **Recommended Size:** 1920x1080px or larger
- **Description:** Background image for the hero section with gradient overlay

#### Left Column
- **CMS Element:** `hero.leftColumn`
- **Description:** Contains static branding text (can be made dynamic if needed)

#### Right Column - Title
- **CMS Field:** `hero.title`
- **Type:** Text (Rich Text optional)
- **Max Length:** ~80 characters
- **Example:** "Building the Future of AI-Powered Automation"

#### Right Column - Subtitle
- **CMS Field:** `hero.subtitle`
- **Type:** Text (Rich Text optional)
- **Max Length:** ~200 characters
- **Example:** "We design, build, and scale intelligent products that automate work, amplify creativity, and connect ideas to results."

---

## SECTION 2: Product Carousel Section

**Section ID:** `product-carousel`  
**CMS Section:** `productCarousel`

### Elements

#### Product Logos Collection
- **CMS Collection:** `productLogos[]`
- **Type:** Array of objects
- **Minimum Items:** 6 (for smooth infinite scroll)
- **Recommended Items:** 8-12

#### Individual Logo Item
Each item in the `productLogos[]` array contains:

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `productLogos[i].id` | Number | Unique identifier |
| Name | `productLogos[i].name` | Text | Product/company name (for alt text) |
| Logo URL | `productLogos[i].logoUrl` | Image URL | Logo image (transparent PNG recommended, 200x80px) |

**Example Structure:**
```json
{
  "productLogos": [
    {
      "id": 1,
      "name": "Product Alpha",
      "logoUrl": "/uploads/logo-alpha.png"
    },
    {
      "id": 2,
      "name": "Product Beta",
      "logoUrl": "/uploads/logo-beta.png"
    }
  ]
}
```

---

## SECTION 3: Products & Services Section

**Section ID:** `products-services`  
**CMS Section:** `productsServices`

### Elements

#### Title
- **CMS Field:** `productsServices.title`
- **Type:** Text
- **Max Length:** ~50 characters
- **Example:** "What We Do"

#### Description
- **CMS Field:** `productsServices.description`
- **Type:** Rich Text / Long Text
- **Max Length:** ~500 characters
- **Example:** "LinkTrend Media is a technology company dedicated to creating, launching, and marketing next-generation applications..."

#### Image
- **CMS Field:** `productsServices.imageUrl`
- **Type:** Image URL
- **Recommended Size:** 800x600px or larger
- **Description:** Image showcasing products and services

---

## SECTION 4: Values Section

**Section ID:** `values`  
**CMS Section:** `values`

### Sub-Section: Mission & Vision

#### Mission
- **CMS Element:** `values.mission`

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| Title | `values.mission.title` | Text | Section title (e.g., "Our Mission") |
| Description | `values.mission.description` | Rich Text | Mission statement (~150 characters) |

#### Vision
- **CMS Element:** `values.vision`

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| Title | `values.vision.title` | Text | Section title (e.g., "Our Vision") |
| Description | `values.vision.description` | Rich Text | Vision statement (~150 characters) |

### Sub-Section: Core Values (4 Cards)

#### Core Values Collection
- **CMS Collection:** `values.coreValues[]`
- **Type:** Array of objects
- **Fixed Items:** 4 (displayed in 2x2 grid)

#### Individual Value Card
Each item in the `values.coreValues[]` array contains:

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| ID | `values.coreValues[i].id` | Number | Unique identifier |
| Icon | `values.coreValues[i].icon` | Text/Select | Icon name (see available icons below) |
| Title | `values.coreValues[i].title` | Text | Value title (~30 characters) |
| Description | `values.coreValues[i].description` | Text | Value description (~100 characters) |

**Available Icons:**
- `Lightbulb` - Innovation
- `Users` - People/Team
- `Shield` - Security/Trust
- `TrendingUp` - Growth
- `Target` - Goals/Focus
- `Heart` - Care/Passion
- `Zap` - Speed/Energy
- `Award` - Excellence

**Example Structure:**
```json
{
  "values": {
    "mission": {
      "title": "Our Mission",
      "description": "To empower businesses with AI-first solutions..."
    },
    "vision": {
      "title": "Our Vision",
      "description": "To become the leading platform for intelligent automation..."
    },
    "coreValues": [
      {
        "id": 1,
        "icon": "Lightbulb",
        "title": "Innovation First",
        "description": "We push boundaries and embrace new technologies..."
      },
      {
        "id": 2,
        "icon": "Users",
        "title": "Customer Obsession",
        "description": "Our customers' success is our success..."
      },
      {
        "id": 3,
        "icon": "Shield",
        "title": "Trust & Transparency",
        "description": "We build trust through honest communication..."
      },
      {
        "id": 4,
        "icon": "TrendingUp",
        "title": "Continuous Growth",
        "description": "We invest in learning and improvement..."
      }
    ]
  }
}
```

---

## SECTION 5: CTA Section

**Section ID:** `cta`  
**CMS Section:** `cta`

### Elements

#### Left Column
- **CMS Element:** `cta.leftColumn`

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| Title | `cta.leftColumn.title` | Text | CTA headline (~50 characters) |
| Description | `cta.leftColumn.description` | Rich Text | Why contact us (~200 characters) |

#### Right Column
- **CMS Element:** `cta.rightColumn`

| Field | CMS Path | Type | Description |
|-------|----------|------|-------------|
| Title | `cta.rightColumn.title` | Text | CTA box title (~30 characters) |
| Subtitle | `cta.rightColumn.subtitle` | Text | CTA box subtitle (~50 characters) |
| Button Text | `cta.rightColumn.buttonText` | Text | Button label (~30 characters) |
| Button URL | `cta.rightColumn.buttonUrl` | URL | External link (full URL with https://) |

**Example Structure:**
```json
{
  "cta": {
    "leftColumn": {
      "title": "Ready to Transform Your Business?",
      "description": "Join hundreds of companies already using our AI-powered automation platform..."
    },
    "rightColumn": {
      "title": "Let's Connect",
      "subtitle": "Partner with us to build the future",
      "buttonText": "Let's Work Together",
      "buttonUrl": "https://linktrend.media/"
    }
  }
}
```

---

## Complete CMS Data Structure

```json
{
  "aboutPage": {
    "hero": {
      "backgroundImage": "/uploads/about-hero-bg.jpg",
      "title": "Building the Future of AI-Powered Automation",
      "subtitle": "We design, build, and scale intelligent products..."
    },
    "productLogos": [
      {
        "id": 1,
        "name": "Product Name",
        "logoUrl": "/uploads/logo.png"
      }
    ],
    "productsServices": {
      "title": "What We Do",
      "description": "LinkTrend Media is a technology company...",
      "imageUrl": "/uploads/products-services.jpg"
    },
    "values": {
      "mission": {
        "title": "Our Mission",
        "description": "To empower businesses with AI-first solutions..."
      },
      "vision": {
        "title": "Our Vision",
        "description": "To become the leading platform..."
      },
      "coreValues": [
        {
          "id": 1,
          "icon": "Lightbulb",
          "title": "Innovation First",
          "description": "We push boundaries..."
        }
      ]
    },
    "cta": {
      "leftColumn": {
        "title": "Ready to Transform Your Business?",
        "description": "Join hundreds of companies..."
      },
      "rightColumn": {
        "title": "Let's Connect",
        "subtitle": "Partner with us to build the future",
        "buttonText": "Let's Work Together",
        "buttonUrl": "https://linktrend.media/"
      }
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
<section id="about-hero" data-cms-section="hero">
  <h2 data-cms-field="hero.title">{heroData.title}</h2>
  <p data-cms-field="hero.subtitle">{heroData.subtitle}</p>
</section>

<div data-cms-collection="productLogos">
  {productLogos.map((logo, index) => (
    <div key={logo.id} data-cms-item={`productLogos[${index}]`}>
      <img 
        src={logo.logoUrl} 
        alt={logo.name}
        data-cms-field={`productLogos[${index}].logoUrl`}
      />
    </div>
  ))}
</div>
```

---

## Integration Notes

1. **Images:** All image URLs should be absolute paths or full URLs
2. **Rich Text:** Fields marked as "Rich Text" can support basic HTML formatting
3. **Collections:** Arrays should maintain order as defined in CMS
4. **External Links:** The CTA button URL should be a full external URL with protocol (https://)
5. **Icons:** Icon names must match exactly (case-sensitive) from the available icons list
6. **Responsive:** All content is responsive and will adapt to mobile/tablet/desktop

---

## Testing Checklist

- [ ] Hero background image loads correctly
- [ ] Hero title and subtitle display properly
- [ ] Product logos carousel scrolls infinitely
- [ ] All 8+ product logos display in grayscale
- [ ] Products & Services image displays
- [ ] Mission and Vision cards render side by side
- [ ] All 4 core values cards display in 2x2 grid
- [ ] Icons match their respective values
- [ ] CTA section displays both columns
- [ ] External CTA button link works
- [ ] All content is editable via CMS
- [ ] Mobile responsive layout works correctly






