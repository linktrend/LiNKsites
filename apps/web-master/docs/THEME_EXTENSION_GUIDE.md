# Theme Extension Guide

This guide explains how to extend and override the Master Template's design token system for secondary templates and client sites.

## Table of Contents

1. [Overview](#overview)
2. [Extension Hierarchy](#extension-hierarchy)
3. [Token Override Methods](#token-override-methods)
4. [Secondary Template Customization](#secondary-template-customization)
5. [Client Site Customization](#client-site-customization)
6. [Best Practices](#best-practices)

---

## Overview

The Master Template uses a **three-tier theming system**:

```
Master Template (Base)
    ↓
Secondary Templates (Vertical-specific)
    ↓
Client Sites (Brand-specific)
```

Each tier can override tokens from the tier above it, allowing for:
- **Master Template**: Universal design system
- **Secondary Templates**: Industry/vertical-specific variations (e.g., SaaS, E-commerce, Healthcare)
- **Client Sites**: Brand-specific customizations (colors, fonts, spacing)

---

## Extension Hierarchy

### Token Priority (Highest to Lowest)

1. **Client Site Overrides** (`src/styles/client-overrides.css`)
2. **Secondary Template Tokens** (`src/styles/template-tokens.css`)
3. **Master Template Tokens** (`src/styles/tokens.css`)

### File Structure

```
src/styles/
├── tokens.css              # Master Template (DO NOT EDIT in forks)
├── template-tokens.css     # Secondary Template overrides (optional)
├── client-overrides.css    # Client-specific overrides (optional)
└── globals.css             # Imports all token files
```

---

## Token Override Methods

### Method 1: CSS Variable Overrides (Recommended)

**Best for**: Simple color, font, or spacing changes

Create `src/styles/client-overrides.css`:

```css
/* Client Brand Overrides */
:root {
  /* Brand Colors */
  --color-primary: #ff6b35;
  --color-primary-foreground: #ffffff;
  
  /* Brand Typography */
  --font-family: "Montserrat", system-ui, sans-serif;
  
  /* Adjust Border Radius for brand style */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

Import in `globals.css`:

```css
@import './tokens.css';           /* Master Template */
@import './template-tokens.css';  /* Secondary Template (if exists) */
@import './client-overrides.css'; /* Client Overrides */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Method 2: TypeScript Config Override

**Best for**: Programmatic theme generation or complex logic

Update `config/theme.config.ts`:

```typescript
import { DEFAULT_THEME, type Theme } from './theme.config';

// Create a custom theme by extending the default
export const CLIENT_THEME: Theme = {
  ...DEFAULT_THEME,
  id: 'client-brand',
  name: 'Client Brand Theme',
  tokens: {
    ...DEFAULT_THEME.tokens,
    colors: {
      ...DEFAULT_THEME.tokens.colors,
      primary: '#ff6b35',
      primaryForeground: '#ffffff',
      accent: '#4ecdc4',
      accentForeground: '#ffffff',
    },
    typography: {
      ...DEFAULT_THEME.tokens.typography,
      fontFamily: "'Montserrat', system-ui, sans-serif",
      fontFamilyHeading: "'Playfair Display', serif",
    },
  },
};

// Export as default theme
export const THEMES = {
  default: CLIENT_THEME,
  // ... other themes
};
```

### Method 3: Environment Variable Override

**Best for**: Multi-tenant deployments or runtime configuration

Set in `.env.local`:

```bash
NEXT_PUBLIC_DEFAULT_THEME=client-brand
NEXT_PUBLIC_SITE_NAME=Client Co
```

Then reference in theme config:

```typescript
export const THEME_CONFIG = {
  defaultVariant: ENV.THEME.DEFAULT_THEME,
  // ...
};
```

---

## Secondary Template Customization

### Creating a Vertical-Specific Template

**Example: SaaS Template**

1. **Create template token file** (`src/styles/template-tokens.css`):

```css
/* SaaS Template Tokens */
:root {
  /* SaaS-optimized colors */
  --color-primary: #6366f1;
  --color-primary-foreground: #ffffff;
  --color-accent: #8b5cf6;
  
  /* Modern SaaS gradients */
  --gradient-brand-from: 99 102% 52%;
  --gradient-brand-to: 262 83% 58%;
  
  /* SaaS-specific surfaces */
  --surface-dashboard: 220 13% 18%;
  --surface-sidebar: 220 17% 15%;
}
```

2. **Update theme config** (`config/theme.config.ts`):

```typescript
export const SAAS_THEME: Theme = {
  id: 'saas',
  name: 'SaaS Template',
  designSystemVersion: 'v1',
  tokens: {
    colors: {
      ...DEFAULT_COLORS,
      primary: '#6366f1',
      accent: '#8b5cf6',
      // ... SaaS-specific colors
    },
    // ... other tokens
  },
};

export const THEMES = {
  default: SAAS_THEME,
  dark: DARK_SAAS_THEME,
  // ...
};
```

3. **Document the template** (`docs/SAAS_TEMPLATE_GUIDE.md`):

```markdown
# SaaS Template Customization Guide

This template is optimized for SaaS products with:
- Modern gradient-based design
- Dashboard-optimized color palette
- High-contrast UI for data visualization

## Customization Points
- Primary color: `--color-primary`
- Accent color: `--color-accent`
- Dashboard surface: `--surface-dashboard`
```

---

## Client Site Customization

### Quick Start: Brand Color Override

**Minimal client customization** (5 minutes):

1. Create `src/styles/client-overrides.css`:

```css
:root {
  /* Brand Colors */
  --color-primary: #YOUR_BRAND_COLOR;
  --color-accent: #YOUR_ACCENT_COLOR;
  
  /* Brand Font */
  --font-family: "YourFont", system-ui, sans-serif;
}
```

2. Update `src/app/layout.tsx` to load brand font:

```typescript
import { Inter, YourFont } from 'next/font/google';

const yourFont = YourFont({ 
  subsets: ['latin'],
  variable: '--font-family',
});
```

3. Update `.env.local`:

```bash
NEXT_PUBLIC_SITE_NAME=Your Company
NEXT_PUBLIC_SITE_URL=https://yourcompany.com
```

### Advanced: Full Brand System

**Complete brand customization** (30 minutes):

1. **Define brand tokens** (`src/styles/client-overrides.css`):

```css
:root {
  /* Brand Colors */
  --color-primary: #1a73e8;
  --color-primary-foreground: #ffffff;
  --color-secondary: #34a853;
  --color-secondary-foreground: #ffffff;
  --color-accent: #ea4335;
  --color-accent-foreground: #ffffff;
  
  /* Brand Typography */
  --font-family: "Google Sans", system-ui, sans-serif;
  --font-family-heading: "Google Sans Display", system-ui, sans-serif;
  
  /* Brand Spacing (if different) */
  --spacing-lg: 1.75rem;
  --spacing-xl: 2.5rem;
  
  /* Brand Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  
  /* Brand Gradients */
  --gradient-brand-from: 217 89% 61%;
  --gradient-brand-to: 142 76% 36%;
  
  /* Brand Shadows */
  --shadow-brand: 0 4px 6px -1px rgba(26, 115, 232, 0.1);
}
```

2. **Update template config** (`template.config.json`):

```json
{
  "template": {
    "id": "client-yourcompany",
    "name": "Your Company Site",
    "parent": "master-template",
    "version": "1.0.0"
  },
  "branding": {
    "companyName": "Your Company",
    "tagline": "Your Tagline",
    "colors": {
      "primary": "#1a73e8",
      "accent": "#ea4335"
    }
  }
}
```

3. **Create brand-specific components** (if needed):

```typescript
// src/components/brand/BrandHero.tsx
export function BrandHero() {
  return (
    <section className="bg-gradient-to-r from-[hsl(var(--gradient-brand-from))] to-[hsl(var(--gradient-brand-to))]">
      {/* Brand-specific hero */}
    </section>
  );
}
```

---

## Best Practices

### DO ✅

1. **Override tokens, not components**
   - Change `--color-primary` instead of editing Button component
   - Keeps components consistent across updates

2. **Use semantic tokens**
   - Use `--color-primary` instead of hardcoded `#1a73e8`
   - Enables theme switching and dark mode

3. **Document your overrides**
   - Create `docs/CLIENT_CUSTOMIZATION.md`
   - List all overridden tokens and reasons

4. **Test theme switching**
   - Ensure overrides work in light/dark modes
   - Test with `data-theme="dark"` attribute

5. **Version your customizations**
   - Track changes in `CHANGELOG.md`
   - Tag releases: `v1.0.0-client-yourcompany`

### DON'T ❌

1. **Don't edit Master Template files directly**
   - Never modify `src/styles/tokens.css`
   - Use override files instead

2. **Don't hardcode colors in components**
   - Bad: `className="bg-[#1a73e8]"`
   - Good: `className="bg-primary"`

3. **Don't override too many tokens**
   - Only override what's necessary for brand
   - Preserve design system consistency

4. **Don't skip documentation**
   - Future developers need to understand customizations
   - Document the "why" not just the "what"

5. **Don't break accessibility**
   - Maintain color contrast ratios (WCAG AA: 4.5:1)
   - Test with accessibility tools

---

## Token Reference

### Core Tokens (Most Commonly Overridden)

| Token | Purpose | Example |
|-------|---------|---------|
| `--color-primary` | Brand primary color | `#1a73e8` |
| `--color-accent` | Accent/CTA color | `#ea4335` |
| `--font-family` | Body font | `"Inter", sans-serif` |
| `--font-family-heading` | Heading font | `"Playfair", serif` |
| `--radius-md` | Border radius | `10px` |
| `--spacing-lg` | Large spacing | `1.5rem` |

### Advanced Tokens (Rarely Overridden)

| Token | Purpose | Example |
|-------|---------|---------|
| `--gradient-brand-from` | Gradient start (HSL) | `217 89% 61%` |
| `--surface-inverse` | Dark surface (HSL) | `223 39% 13%` |
| `--shadow-brand` | Custom shadow | `0 4px 6px rgba(...)` |

---

## Examples

### Example 1: Healthcare Template

```css
/* Healthcare vertical - calming, trustworthy colors */
:root {
  --color-primary: #0077b6;      /* Medical blue */
  --color-accent: #00b4d8;       /* Lighter blue */
  --color-success: #06d6a0;      /* Health green */
  --font-family: "Source Sans Pro", sans-serif;
  --radius-md: 8px;              /* Softer corners */
}
```

### Example 2: E-commerce Template

```css
/* E-commerce vertical - bold, conversion-focused */
:root {
  --color-primary: #ff6b35;      /* Energetic orange */
  --color-accent: #f7931e;       /* Warm accent */
  --color-success: #4caf50;      /* Purchase success */
  --font-family: "Roboto", sans-serif;
  --radius-lg: 12px;             /* Modern, rounded */
}
```

### Example 3: Financial Services

```css
/* Financial services - professional, secure */
:root {
  --color-primary: #1e3a8a;      /* Navy blue */
  --color-accent: #3b82f6;       /* Trust blue */
  --color-success: #059669;      /* Wealth green */
  --font-family: "IBM Plex Sans", sans-serif;
  --radius-sm: 4px;              /* Conservative, sharp */
}
```

---

## Troubleshooting

### Issue: Overrides not applying

**Solution**: Check import order in `globals.css`:

```css
@import './tokens.css';           /* 1. Base */
@import './template-tokens.css';  /* 2. Template */
@import './client-overrides.css'; /* 3. Client (should be last) */
```

### Issue: Dark mode not working

**Solution**: Define overrides for both themes:

```css
:root {
  --color-primary: #1a73e8;
}

:root[data-theme="dark"] {
  --color-primary: #4285f4; /* Lighter for dark mode */
}
```

### Issue: Fonts not loading

**Solution**: Ensure font is imported in layout:

```typescript
import { YourFont } from 'next/font/google';

const yourFont = YourFont({ 
  subsets: ['latin'],
  variable: '--font-family',
});

// Apply in <html> tag
<html className={yourFont.variable}>
```

---

## Support

For questions or issues:

1. Check `docs/THEMING_COMPLETE.md` for full token reference
2. Review `config/theme.config.ts` for TypeScript types
3. See `src/styles/tokens.css` for all available tokens
4. Contact template maintainers for complex customizations

---

**Last Updated**: December 2025  
**Version**: 1.0.0
