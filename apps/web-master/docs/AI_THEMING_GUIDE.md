# AI Theming Guide

**Version:** 1.0.0  
**Last Updated:** December 5, 2025  
**For:** AI Agents creating themed sub-templates

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start for AI Agents](#quick-start-for-ai-agents)
3. [Theme Creation Process](#theme-creation-process)
4. [Industry Preset Examples](#industry-preset-examples)
5. [AI Prompt Templates](#ai-prompt-templates)
6. [Token Modification Patterns](#token-modification-patterns)
7. [Testing Checklist](#testing-checklist)
8. [Common Theming Scenarios](#common-theming-scenarios)

---

## Overview

This guide provides step-by-step instructions for AI agents to create themed sub-templates from the Master Template. The theming system uses:

- **`config/theme.json`**: AI-editable theme configuration
- **`src/styles/tokens.css`**: CSS variables (manual sync required)
- **`tailwind.config.ts`**: Tailwind utility mappings

### Design System Architecture

```
theme.json (AI edits here)
    ↓
tokens.css (manual sync)
    ↓
tailwind.config.ts (auto-maps)
    ↓
Components (use Tailwind classes)
```

---

## Quick Start for AI Agents

### Step 1: Read Current Theme

```bash
# Read the current theme configuration
cat config/theme.json
```

### Step 2: Choose Industry Preset

Select from available presets in `theme.json`:
- `saas` - SaaS platforms
- `healthcare` - Medical/healthcare
- `finance` - Financial services
- `ecommerce` - Online retail
- `legal` - Law firms
- `realestate` - Real estate
- `education` - Schools/universities
- `restaurant` - Food service
- `agency` - Creative agencies
- `nonprofit` - Non-profit organizations

### Step 3: Apply Theme

Copy preset values into main theme object:

```json
{
  "theme": {
    "colors": {
      "primary": "#0077b6",  // from healthcare preset
      "accent": "#00b4d8",
      // ... other values
    }
  }
}
```

### Step 4: Update CSS Variables

Manually update `src/styles/tokens.css`:

```css
:root {
  --color-primary: #0077b6;
  --color-accent: #00b4d8;
  /* ... other variables */
}
```

### Step 5: Test

```bash
# Build and test
pnpm build
pnpm dev
```

---

## Theme Creation Process

### Process Flow

1. **Analyze Requirements**
   - Industry/vertical
   - Brand personality
   - Target audience
   - Accessibility needs

2. **Select Base Preset**
   - Choose closest industry preset
   - Or start with default theme

3. **Customize Colors**
   - Primary brand color
   - Accent color
   - Background/foreground
   - Semantic colors (success, warning, etc.)

4. **Adjust Typography**
   - Font family
   - Font sizes
   - Font weights
   - Line heights

5. **Configure Spacing**
   - Padding/margin scale
   - Section gaps
   - Component spacing

6. **Set Border Radius**
   - Sharp (0-4px) for corporate
   - Moderate (6-10px) for balanced
   - Rounded (12-16px) for friendly

7. **Define Motion**
   - Animation duration
   - Easing functions
   - Transition timing

8. **Update Files**
   - Edit `theme.json`
   - Sync to `tokens.css`
   - Test in browser

---

## Industry Preset Examples

### SaaS Platform

**Brand Personality:** Modern, tech-forward, professional

**Theme Configuration:**

```json
{
  "colors": {
    "primary": "#0ea5e9",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "foreground": "#0f172a"
  },
  "typography": {
    "fontFamily": "'Inter', system-ui, sans-serif",
    "fontFamilyHeading": "'Inter', system-ui, sans-serif"
  },
  "radius": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px"
  },
  "motion": {
    "duration": {
      "normal": "300ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}
```

**CSS Variables:**

```css
:root {
  --color-primary: #0ea5e9;
  --color-accent: #3b82f6;
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --font-family: "Inter", system-ui, sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

---

### Healthcare

**Brand Personality:** Trustworthy, calm, professional

**Theme Configuration:**

```json
{
  "colors": {
    "primary": "#0077b6",
    "accent": "#00b4d8",
    "background": "#ffffff",
    "foreground": "#023e8a"
  },
  "typography": {
    "fontFamily": "'Source Sans Pro', system-ui, sans-serif",
    "fontFamilyHeading": "'Source Sans Pro', system-ui, sans-serif"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px"
  }
}
```

**Key Characteristics:**
- Blue tones (trust, professionalism)
- Clean, readable fonts
- Moderate border radius
- Accessible color contrast

---

### Financial Services

**Brand Personality:** Trustworthy, stable, authoritative

**Theme Configuration:**

```json
{
  "colors": {
    "primary": "#1e3a8a",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "foreground": "#1e293b"
  },
  "typography": {
    "fontFamily": "'IBM Plex Sans', system-ui, sans-serif",
    "fontFamilyHeading": "'IBM Plex Sans', system-ui, sans-serif"
  },
  "radius": {
    "sm": "2px",
    "md": "4px",
    "lg": "6px"
  }
}
```

**Key Characteristics:**
- Dark blue (stability, trust)
- Professional serif or sans-serif
- Minimal border radius (sharp, precise)
- Conservative design

---

### E-commerce

**Brand Personality:** Energetic, friendly, conversion-focused

**Theme Configuration:**

```json
{
  "colors": {
    "primary": "#ff6b35",
    "accent": "#f7931e",
    "background": "#ffffff",
    "foreground": "#2d3748"
  },
  "typography": {
    "fontFamily": "'Roboto', system-ui, sans-serif",
    "fontFamilyHeading": "'Roboto', system-ui, sans-serif"
  },
  "radius": {
    "sm": "6px",
    "md": "10px",
    "lg": "14px"
  }
}
```

**Key Characteristics:**
- Warm, energetic colors
- Clear, readable fonts
- Moderate roundness
- High contrast CTAs

---

### Restaurant/Food Service

**Brand Personality:** Warm, inviting, appetizing

**Theme Configuration:**

```json
{
  "colors": {
    "primary": "#dc2626",
    "accent": "#f59e0b",
    "background": "#fffbeb",
    "foreground": "#78350f"
  },
  "typography": {
    "fontFamily": "'Poppins', system-ui, sans-serif",
    "fontFamilyHeading": "'Playfair Display', serif"
  },
  "radius": {
    "sm": "6px",
    "md": "10px",
    "lg": "14px"
  }
}
```

**Key Characteristics:**
- Warm colors (red, orange, yellow)
- Elegant heading font
- Friendly body font
- Inviting design

---

## AI Prompt Templates

### Template 1: Create New Industry Theme

```
Create a themed sub-template for [INDUSTRY] with the following characteristics:

Industry: [e.g., Healthcare, Finance, E-commerce]
Brand Personality: [e.g., Professional, Friendly, Modern]
Primary Color: [HEX code]
Accent Color: [HEX code]
Font Preference: [e.g., Sans-serif, Serif, Modern]
Border Radius Style: [Sharp, Moderate, Rounded]

Steps:
1. Read config/theme.json
2. Select closest industry preset from industryPresets
3. Modify colors to match brand
4. Update typography based on font preference
5. Adjust border radius based on style
6. Update src/styles/tokens.css with new values
7. Test build: pnpm build
```

---

### Template 2: Customize Existing Preset

```
Customize the [PRESET_NAME] theme with these modifications:

Base Preset: [e.g., saas, healthcare, finance]
Modifications:
- Primary Color: [HEX] (currently [CURRENT_HEX])
- Accent Color: [HEX] (currently [CURRENT_HEX])
- Font Family: [FONT_NAME] (currently [CURRENT_FONT])
- Border Radius: [STYLE] (currently [CURRENT_STYLE])

Steps:
1. Copy values from theme.json.industryPresets.[PRESET_NAME]
2. Apply modifications to theme.theme object
3. Update src/styles/tokens.css
4. Verify changes in browser
```

---

### Template 3: Brand Color Conversion

```
Convert brand colors to theme configuration:

Brand Colors:
- Primary: [HEX]
- Secondary: [HEX]
- Accent: [HEX]
- Background: [HEX]
- Text: [HEX]

Steps:
1. Map brand primary → theme.colors.primary
2. Map brand secondary → theme.colors.accent
3. Map brand accent → theme.colors.accent-red (for CTAs)
4. Map background → theme.colors.background
5. Map text → theme.colors.foreground
6. Generate complementary colors for muted, card, border
7. Ensure WCAG AA contrast ratios
8. Update tokens.css
```

---

### Template 4: Multi-Brand Theme

```
Create theme variants for multiple brands:

Brand A:
- Name: [BRAND_A_NAME]
- Primary: [HEX]
- Accent: [HEX]

Brand B:
- Name: [BRAND_B_NAME]
- Primary: [HEX]
- Accent: [HEX]

Steps:
1. Create theme-brand-a.json
2. Create theme-brand-b.json
3. Each theme extends base theme.json
4. Create separate tokens-brand-a.css
5. Create separate tokens-brand-b.css
6. Use data-theme attribute to switch: data-theme="brand-a"
```

---

## Token Modification Patterns

### Color Modifications

**Pattern 1: Change Primary Brand Color**

```json
// theme.json
{
  "theme": {
    "colors": {
      "primary": "#NEW_COLOR",
      "primaryForeground": "#CONTRAST_COLOR"
    }
  }
}
```

```css
/* tokens.css */
:root {
  --color-primary: #NEW_COLOR;
  --color-primary-foreground: #CONTRAST_COLOR;
}
```

**Pattern 2: Adjust Semantic Colors**

```json
{
  "theme": {
    "colors": {
      "success": "#22c55e",
      "warning": "#f59e0b",
      "destructive": "#ef4444"
    }
  }
}
```

---

### Typography Modifications

**Pattern 1: Change Font Family**

```json
{
  "theme": {
    "typography": {
      "fontFamily": "'Roboto', system-ui, sans-serif",
      "fontFamilyHeading": "'Playfair Display', serif"
    }
  }
}
```

```css
:root {
  --font-family: "Roboto", system-ui, sans-serif;
}
```

**Pattern 2: Adjust Font Scale**

```json
{
  "theme": {
    "typography": {
      "fontSize": {
        "base": "1.125rem",  // Increase from 1rem
        "lg": "1.25rem",
        "xl": "1.5rem"
      }
    }
  }
}
```

---

### Spacing Modifications

**Pattern 1: Tighter Spacing**

```json
{
  "theme": {
    "spacing": {
      "xs": "0.25rem",
      "sm": "0.5rem",
      "md": "0.75rem",
      "lg": "1rem"
    }
  }
}
```

**Pattern 2: Looser Spacing**

```json
{
  "theme": {
    "spacing": {
      "xs": "0.75rem",
      "sm": "1rem",
      "md": "1.5rem",
      "lg": "2rem"
    }
  }
}
```

---

### Border Radius Modifications

**Pattern 1: Sharp (Corporate)**

```json
{
  "theme": {
    "radius": {
      "sm": "0px",
      "md": "2px",
      "lg": "4px"
    }
  }
}
```

**Pattern 2: Rounded (Friendly)**

```json
{
  "theme": {
    "radius": {
      "sm": "12px",
      "md": "16px",
      "lg": "20px"
    }
  }
}
```

---

## Testing Checklist

### Visual Testing

- [ ] Homepage renders correctly
- [ ] All sections use new theme colors
- [ ] Typography is readable and consistent
- [ ] Spacing feels balanced
- [ ] Border radius is consistent
- [ ] Buttons and CTAs are prominent
- [ ] Forms are usable
- [ ] Navigation is clear

### Accessibility Testing

- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states are visible
- [ ] Interactive elements are distinguishable
- [ ] Text is readable at all sizes
- [ ] Links are identifiable

### Responsive Testing

- [ ] Mobile (320px-767px)
- [ ] Tablet (768px-1023px)
- [ ] Desktop (1024px+)
- [ ] Large desktop (1920px+)

### Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Performance Testing

- [ ] Build completes without errors
- [ ] No console errors
- [ ] Page load time < 3s
- [ ] Lighthouse score > 90

---

## Common Theming Scenarios

### Scenario 1: Client Provides Brand Guidelines

**Input:**
- Brand colors (primary, secondary, accent)
- Typography (font families)
- Logo and assets

**Process:**
1. Extract hex codes from brand guidelines
2. Map to theme.json color tokens
3. Install brand fonts (Google Fonts or custom)
4. Update font-family tokens
5. Ensure accessibility compliance
6. Test across all pages

---

### Scenario 2: Create Sub-Template for Vertical

**Input:**
- Industry/vertical (e.g., "Healthcare")
- No specific brand yet

**Process:**
1. Select industry preset from theme.json
2. Copy preset values to main theme
3. Update tokens.css
4. Customize component content for vertical
5. Adjust terminology (e.g., "Patients" vs "Customers")
6. Test with sample content

---

### Scenario 3: Dark Mode Theme

**Input:**
- Existing light theme
- Need dark mode variant

**Process:**
1. Copy theme.theme to theme.darkTheme
2. Invert background/foreground
3. Adjust color saturation for dark backgrounds
4. Ensure contrast ratios still meet WCAG
5. Update tokens.css :root[data-theme="dark"]
6. Test theme toggle functionality

---

### Scenario 4: Seasonal Theme

**Input:**
- Temporary seasonal branding (e.g., holiday)
- Revert after period

**Process:**
1. Create theme-seasonal.json
2. Modify accent colors for season
3. Add seasonal gradients
4. Create tokens-seasonal.css
5. Use data-theme="seasonal" attribute
6. Schedule revert date

---

## Additional Resources

- **Theme Configuration**: `config/theme.json`
- **CSS Tokens**: `src/styles/tokens.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Theme Documentation**: `docs/THEMING_COMPLETE.md`
- **Quick Reference**: `docs/THEMING_QUICK_REFERENCE.md`

---

## Example AI Workflow

### Complete Theme Creation

```bash
# 1. Read current theme
cat config/theme.json

# 2. Identify requirements
# Industry: Healthcare
# Primary: #0077b6
# Accent: #00b4d8
# Font: Source Sans Pro

# 3. Update theme.json
# Copy healthcare preset values
# Modify as needed

# 4. Update tokens.css
# Sync all color values
# Update font-family

# 5. Build and test
pnpm build
pnpm dev

# 6. Verify in browser
# Check all pages
# Test responsive
# Validate accessibility
```

---

**For AI Agents:**

This guide is designed to be parsed and executed programmatically. Follow the step-by-step instructions, use the prompt templates, and always validate changes with the testing checklist.

**Manual Sync Required:**

Currently, changes to `theme.json` must be manually synced to `tokens.css`. Future versions may include automated generation scripts.
