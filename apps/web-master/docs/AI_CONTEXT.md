# AI Context - Master Template Quick Reference

**Version:** 1.0.0  
**Last Updated:** December 5, 2025  
**For:** AI Agents (Claude, GPT-4, Gemini, etc.)

---

## Quick Facts

- **Template Type:** Next.js 14 marketing website (App Router)
- **Components:** 77 production-ready components
- **Languages:** English, Spanish, Chinese (Traditional/Simplified)
- **Styling:** Tailwind CSS + CSS Variables (design tokens)
- **CMS:** Payload CMS (integration pending)
- **Status:** Production-ready, awaiting CMS integration

---

## Essential Files for AI Agents

### 1. Component Registry (JSON)
**File:** `docs/components/index.json`  
**Purpose:** Machine-readable component metadata  
**Use:** Parse this to discover available components, props, and use cases

### 2. Theme Configuration (JSON)
**File:** `config/theme.json`  
**Purpose:** AI-editable theme settings  
**Use:** Modify this to create themed sub-templates

### 3. Component Library (Markdown)
**File:** `docs/COMPONENT_LIBRARY.md`  
**Purpose:** Human-readable component documentation  
**Use:** Reference for detailed component usage

### 4. AI Theming Guide
**File:** `docs/AI_THEMING_GUIDE.md`  
**Purpose:** Step-by-step theming instructions for AI  
**Use:** Follow this to create industry-specific themes

### 5. Component Examples
**File:** `docs/COMPONENT_EXAMPLES.md`  
**Purpose:** Real-world usage patterns  
**Use:** Reference for page composition and patterns

---

## Codebase Structure

```
/Users/carlossalas/Projects/Dev_Sites/projects/linktrend/
├── src/
│   ├── app/[lang]/          # Next.js pages (multi-language)
│   ├── components/          # 77 components in 11 categories
│   │   ├── marketing/       # Hero, showcases, CTAs (13)
│   │   ├── common/          # Utilities, modals (11)
│   │   ├── contact/         # Forms, channels (11)
│   │   ├── help/            # Help center (9)
│   │   ├── navigation/      # Header, footer (2)
│   │   ├── pricing/         # Pricing components (2)
│   │   ├── resources/       # Content listings (5)
│   │   ├── ui/              # Base UI (9 - shadcn/ui)
│   │   ├── modals/          # Modal dialogs (1)
│   │   ├── layouts/         # Layout wrappers (1)
│   │   ├── icons/           # Custom icons (1)
│   │   └── about/           # About page (1)
│   ├── layouts/             # Page layouts (11)
│   ├── lib/                 # Utilities, helpers
│   └── styles/              # CSS (tokens.css, globals.css)
├── config/                  # Configuration files
│   ├── theme.json           # AI-editable theme config
│   ├── theme.config.ts      # TypeScript theme config
│   ├── site.config.ts       # Site configuration
│   ├── env.config.ts        # Environment variables
│   └── cms.config.ts        # CMS configuration
├── docs/                    # Documentation (68+ files)
│   ├── components/          # Component registry
│   │   └── index.json       # Machine-readable metadata
│   ├── COMPONENT_LIBRARY.md # Component docs
│   ├── AI_THEMING_GUIDE.md  # Theming for AI
│   └── MASTER_TEMPLATE_INDEX.md # Doc index
├── messages/                # i18n translations (JSON)
├── public/                  # Static assets
└── template.config.json     # Template configuration
```

---

## Component Discovery

### Method 1: Parse JSON Registry

```javascript
// Read component registry
const registry = JSON.parse(fs.readFileSync('docs/components/index.json'));

// Find components by tag
const heroComponents = Object.values(registry.categories)
  .flatMap(cat => Object.entries(cat.components))
  .filter(([name, comp]) => comp.tags.includes('hero'));

// Find components by use case
const homepageComponents = Object.values(registry.categories)
  .flatMap(cat => Object.entries(cat.components))
  .filter(([name, comp]) => comp.useCases.includes('homepage'));
```

### Method 2: Search by Category

```javascript
// Get all marketing components
const marketing = registry.categories.marketing.components;

// Get specific component
const signupHero = marketing.SignupHero;
console.log(signupHero.props); // See required props
console.log(signupHero.example); // See usage example
```

---

## Theme Creation Workflow

### Step 1: Choose Industry Preset

Available presets in `config/theme.json`:
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

### Step 2: Extract Preset Values

```javascript
// Read theme.json
const themeConfig = JSON.parse(fs.readFileSync('config/theme.json'));

// Get healthcare preset
const healthcarePreset = themeConfig.industryPresets.healthcare;

// Extract colors
const primaryColor = healthcarePreset.colors.primary; // #0077b6
const accentColor = healthcarePreset.colors.accent;   // #00b4d8
```

### Step 3: Update Theme Configuration

```javascript
// Update main theme with preset values
themeConfig.theme.colors.primary = healthcarePreset.colors.primary;
themeConfig.theme.colors.accent = healthcarePreset.colors.accent;
themeConfig.theme.typography.fontFamily = healthcarePreset.typography.fontFamily;

// Write back to theme.json
fs.writeFileSync('config/theme.json', JSON.stringify(themeConfig, null, 2));
```

### Step 4: Update CSS Variables

```css
/* src/styles/tokens.css */
:root {
  --color-primary: #0077b6;  /* from healthcare preset */
  --color-accent: #00b4d8;
  --font-family: "Source Sans Pro", system-ui, sans-serif;
}
```

### Step 5: Build and Test

```bash
pnpm build
pnpm dev
```

---

## Common AI Tasks

### Task 1: Create Sub-Template for Industry

**Input:** Industry name (e.g., "Healthcare")

**Process:**
1. Read `config/theme.json`
2. Extract `industryPresets.healthcare`
3. Copy values to `theme.theme`
4. Update `src/styles/tokens.css`
5. Build: `pnpm build`

**Output:** Themed sub-template ready for deployment

---

### Task 2: Customize Component for Client

**Input:** Component name, customization requirements

**Process:**
1. Read `docs/components/index.json`
2. Find component by name
3. Review props and examples
4. Create customized version
5. Test in browser

**Example:**
```typescript
// Find SignupHero component
const signupHero = registry.categories.marketing.components.SignupHero;

// Review props
console.log(signupHero.props.lang); // { type: "string", required: true }

// Use component
<SignupHero lang="en" />
```

---

### Task 3: Build Homepage from Components

**Input:** Page requirements (sections needed)

**Process:**
1. Query `docs/components/index.json` for components with `useCases: ["homepage"]`
2. Select components based on requirements
3. Compose page using layout pattern from `docs/COMPONENT_EXAMPLES.md`
4. Test responsive design

**Example Composition:**
```tsx
// Homepage with hero, features, pricing, CTA
<>
  <SignupHero lang="en" />
  <PlatformFeatures lang="en" />
  <PricingHomepage lang="en" />
  <CTASection lang="en" />
</>
```

---

## Key Conventions

### Component Naming
- **PascalCase** for component names
- **File extension:** `.tsx`
- **Client components:** Use `"use client"` directive
- **Server components:** No directive (default)

### Props Patterns
- Most components accept `lang` prop (string, required)
- CMS-driven components accept typed objects (`CmsOffer[]`, `CmsResource[]`, etc.)
- All components use TypeScript interfaces for props

### Styling
- **Design tokens:** Use CSS variables from `src/styles/tokens.css`
- **Tailwind classes:** `bg-primary`, `text-foreground`, `rounded-md`
- **Responsive:** `sm:`, `md:`, `lg:`, `xl:` breakpoints

### Internationalization
- Use `next-intl` for translations
- Import: `import { useTranslations } from 'next-intl';`
- Usage: `const t = useTranslations(); t('key')`

### Routing
- Use routes helper: `import { routes } from '@/lib/routes';`
- Example: `routes.home(lang)`, `routes.offer(lang, slug)`

---

## Design Token Reference

### Colors
```css
--color-primary          /* Brand primary */
--color-accent           /* CTA/accent */
--color-background       /* Page background */
--color-foreground       /* Primary text */
--color-muted            /* Subtle backgrounds */
--color-card             /* Card backgrounds */
--color-border           /* Borders */
```

### Typography
```css
--font-family            /* Body font */
```

### Spacing
```css
--spacing-xs             /* 0.5rem / 8px */
--spacing-sm             /* 0.75rem / 12px */
--spacing-md             /* 1rem / 16px */
--spacing-lg             /* 1.5rem / 24px */
--spacing-xl             /* 2rem / 32px */
--spacing-2xl            /* 3rem / 48px */
```

### Border Radius
```css
--radius-sm              /* 6px */
--radius-md              /* 10px */
--radius-lg              /* 14px */
```

### Motion
```css
--duration-fast          /* 150ms */
--duration-normal        /* 300ms */
--duration-slow          /* 500ms */
--easing-default         /* cubic-bezier(0.4, 0, 0.2, 1) */
```

---

## Accessibility Requirements

- **Color Contrast:** WCAG AA (4.5:1 for text)
- **Focus States:** Visible on all interactive elements
- **ARIA Labels:** Required for icons and buttons
- **Semantic HTML:** Use proper heading hierarchy
- **Keyboard Navigation:** All interactive elements accessible

---

## Performance Targets

- **Lighthouse Score:** 90+
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1

---

## File Modification Guidelines

### ✅ Safe to Modify
- `config/theme.json` - Theme configuration
- `src/styles/tokens.css` - CSS variables
- `messages/**/*.json` - Translations
- `template.config.json` - Template config
- `.env.local` - Environment variables

### ⚠️ Modify with Caution
- `config/theme.config.ts` - TypeScript theme (prefer theme.json)
- `tailwind.config.ts` - Tailwind config (only for new utilities)
- `src/components/**/*.tsx` - Components (prefer composition over modification)

### ❌ Do Not Modify
- `config/env.config.ts` - Core environment handling
- `src/middleware.ts` - Core routing
- `src/i18n.ts` - Internationalization core
- `src/lib/analytics.ts` - Analytics system (unless adding providers)

---

## Testing Checklist

### Visual Testing
- [ ] Homepage renders correctly
- [ ] All sections use theme colors
- [ ] Typography is consistent
- [ ] Spacing is balanced
- [ ] Buttons are prominent

### Responsive Testing
- [ ] Mobile (320px-767px)
- [ ] Tablet (768px-1023px)
- [ ] Desktop (1024px+)

### Accessibility Testing
- [ ] Color contrast meets WCAG AA
- [ ] Focus states visible
- [ ] Keyboard navigation works

### Build Testing
- [ ] `pnpm build` completes without errors
- [ ] No console errors in browser
- [ ] All pages load correctly

---

## Common Errors and Solutions

### Error: Component not found
**Solution:** Check `docs/components/index.json` for correct component name and import path

### Error: Invalid prop type
**Solution:** Review component props in registry, ensure correct TypeScript types

### Error: Theme not applying
**Solution:** Verify CSS variables in `tokens.css` match `theme.json`, rebuild with `pnpm build`

### Error: Build fails
**Solution:** Check for TypeScript errors, ensure all required props are provided

---

## Additional Resources

### Documentation
- **Master Index:** `docs/MASTER_TEMPLATE_INDEX.md`
- **Component Library:** `docs/COMPONENT_LIBRARY.md`
- **AI Theming Guide:** `docs/AI_THEMING_GUIDE.md`
- **Component Examples:** `docs/COMPONENT_EXAMPLES.md`

### Configuration
- **Theme Config:** `config/theme.json`
- **Site Config:** `config/site.config.ts`
- **CMS Config:** `config/cms.config.ts`

### Code
- **Component Registry:** `docs/components/index.json`
- **Design Tokens:** `src/styles/tokens.css`
- **Tailwind Config:** `tailwind.config.ts`

---

## AI Agent Workflow Summary

1. **Discover Components:** Parse `docs/components/index.json`
2. **Select Theme:** Choose preset from `config/theme.json`
3. **Customize Theme:** Update colors, fonts, spacing
4. **Update CSS:** Sync changes to `src/styles/tokens.css`
5. **Compose Pages:** Use components from registry
6. **Test:** Build and verify in browser
7. **Deploy:** Follow factory cloning procedures

---

**Status:** ✅ Ready for AI-driven sub-template creation

This master template is designed to be parsed, understood, and modified by AI agents. All documentation is structured for machine readability while remaining human-friendly.
