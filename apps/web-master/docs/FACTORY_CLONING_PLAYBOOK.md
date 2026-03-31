# Factory Cloning Playbook

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Cloning Levels](#cloning-levels)
3. [Master → Secondary Template Cloning](#master--secondary-template-cloning)
4. [Secondary Template → Client Site Cloning](#secondary-template--client-site-cloning)
5. [File Modification Matrix](#file-modification-matrix)
6. [Validation & Testing](#validation--testing)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This playbook provides step-by-step procedures for cloning the Master Template into:
- **Secondary Templates** (vertical/industry-specific templates)
- **Client Sites** (production sites for specific clients)

### Cloning Philosophy

The Master Template is designed to be **brand-agnostic** and **feature-flexible**:
- ✅ No hardcoded brand names (uses `NEXT_PUBLIC_SITE_NAME`)
- ✅ No hardcoded domains (uses `NEXT_PUBLIC_SITE_URL`)
- ✅ No industry-specific assumptions
- ✅ Graceful degradation when services are missing
- ✅ Feature flags for optional functionality

---

## Cloning Levels

### Level 1: Master → Secondary Template

**Purpose:** Create industry/vertical-specific templates (e.g., SaaS, E-commerce, Agency)

**Characteristics:**
- Maintains factory structure
- Can be cloned multiple times
- Adds vertical-specific defaults
- Remains brand-agnostic
- Stored in version control

**Example Use Cases:**
- SaaS template with specific feature defaults
- E-commerce template with product-focused layouts
- Agency template with portfolio emphasis

### Level 2: Secondary Template → Client Site

**Purpose:** Create production sites for specific clients

**Characteristics:**
- Single-use deployment
- Brand-specific configuration
- Client-specific customizations
- Production environment setup
- May diverge from template

**Example Use Cases:**
- Acme Corp SaaS site (from SaaS template)
- Client XYZ e-commerce site (from E-commerce template)
- Agency ABC portfolio (from Agency template)

### Level 3: Master → Client Site (Direct)

**Purpose:** Quick deployment for generic clients

**Characteristics:**
- Skip secondary template step
- Direct customization
- Faster deployment
- Less reusability

---

## Master → Secondary Template Cloning

### Prerequisites

- [ ] Git repository access
- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Understanding of the vertical/industry requirements

### Step 1: Clone the Repository

```bash
# Clone from master template
git clone /path/to/master-template /path/to/secondary-templates/<template-name>
cd /path/to/secondary-templates/<template-name>

# Remove existing git history (optional, for fresh start)
rm -rf .git
git init
git add .
git commit -m "Initial commit from master template"
```

### Step 2: Update Package Metadata

**File:** `package.json`

```json
{
  "name": "company-site-template-<vertical>",
  "version": "0.1.0",
  "description": "Secondary template for <vertical> industry",
  "private": true
}
```

### Step 3: Configure Template Defaults

**File:** `template.config.json`

```json
{
  "template": "company-site-<vertical>",
  "designSystemVersion": "v1",
  "navigation": {
    "primary": [
      // Customize navigation for vertical
      { "labelDocId": "nav-solutions", "slug": "/solutions" },
      { "labelDocId": "nav-resources", "slug": "/resources" }
    ]
  }
}
```

### Step 4: Customize Theme Defaults (Optional)

**File:** `config/theme.config.ts`

```typescript
// Override default theme colors for vertical
const DEFAULT_COLORS: ThemeColors = {
  ...BASE_DEFAULT_COLORS,
  primary: '#your-vertical-primary-color',
  accent: '#your-vertical-accent-color',
};
```

### Step 5: Update Environment Example

**File:** `.env.example`

```bash
# Update with vertical-specific defaults
NEXT_PUBLIC_SITE_NAME="Your Vertical Template"
NEXT_PUBLIC_SITE_URL="https://example.com"

# Add vertical-specific variables if needed
NEXT_PUBLIC_VERTICAL="<vertical-name>"
```

### Step 6: Update Documentation

**File:** `README.md`

- Update title to reflect secondary template name
- Add vertical-specific setup instructions
- Document any custom features
- Update examples to match vertical

### Step 7: Add Vertical-Specific Content (Optional)

Create vertical-specific mock data or CMS schemas:

```bash
# Example: Add industry-specific mock data
src/lib/mockData/<vertical>MockData.ts
```

### Step 8: Test the Template

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

### Step 9: Version Control

```bash
# Create repository for secondary template
git remote add origin <your-secondary-template-repo>
git push -u origin main

# Tag the initial version
git tag -a v0.1.0 -m "Initial secondary template release"
git push --tags
```

### Files to Modify (Secondary Template)

| File | Action | Required |
|------|--------|----------|
| `package.json` | Update name, description | ✅ Required |
| `template.config.json` | Customize defaults | ✅ Required |
| `.env.example` | Update defaults | ✅ Required |
| `README.md` | Update documentation | ✅ Required |
| `config/theme.config.ts` | Customize theme | ⚠️ Optional |
| `config/site.config.ts` | Add vertical defaults | ⚠️ Optional |
| `src/lib/mockData/*` | Add vertical data | ⚠️ Optional |
| `messages/*/pages.json` | Update translations | ⚠️ Optional |

### Files to NOT Modify (Keep Factory Logic)

| File | Reason |
|------|--------|
| `config/env.config.ts` | Core environment handling |
| `config/cms.config.ts` | CMS integration logic |
| `src/lib/analytics.ts` | Analytics system |
| `src/lib/forms/*` | Form handling logic |
| `src/middleware.ts` | Core routing logic |
| `src/i18n.ts` | Internationalization core |

---

## Secondary Template → Client Site Cloning

### Prerequisites

- [ ] Secondary template repository access (or master template)
- [ ] Client branding assets (logo, colors, fonts)
- [ ] Client content (copy, images)
- [ ] Production environment setup
- [ ] Domain/hosting configured

### Step 1: Clone from Template

```bash
# Clone from secondary template (or master)
git clone /path/to/secondary-template /path/to/client-sites/<client-name>
cd /path/to/client-sites/<client-name>

# Remove template git history
rm -rf .git
git init
git add .
git commit -m "Initial commit for <client-name>"
```

### Step 2: Configure Client Identity

**File:** `.env.local` (create from `.env.example`)

```bash
# ============================================================================
# CLIENT IDENTITY
# ============================================================================
NEXT_PUBLIC_SITE_NAME="Client Company Name"
NEXT_PUBLIC_SITE_URL="https://clientdomain.com"
NEXT_PUBLIC_COMPANY_LEGAL_NAME="Client Company Inc."
NEXT_PUBLIC_COMPANY_EMAIL="hello@clientdomain.com"
NEXT_PUBLIC_COMPANY_PHONE="+1-555-0100"

# ============================================================================
# BRANDING
# ============================================================================
NEXT_PUBLIC_DEFAULT_THEME="default"
NEXT_PUBLIC_ALLOW_THEME_SWITCHING="false"

# ============================================================================
# CMS CONNECTION
# ============================================================================
NEXT_PUBLIC_CMS_PROVIDER="payload"
NEXT_PUBLIC_PAYLOAD_API_URL="https://cms.clientdomain.com"
PAYLOAD_API_KEY="<client-cms-api-key>"

# ============================================================================
# ANALYTICS
# ============================================================================
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_FB_PIXEL_ID="123456789"
NEXT_PUBLIC_LINKEDIN_PARTNER_ID="123456"
NEXT_PUBLIC_HOTJAR_ID="123456"

# ============================================================================
# SOCIAL MEDIA
# ============================================================================
NEXT_PUBLIC_TWITTER_HANDLE="@clientcompany"
NEXT_PUBLIC_LINKEDIN_URL="https://linkedin.com/company/clientcompany"
NEXT_PUBLIC_FACEBOOK_URL="https://facebook.com/clientcompany"
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/clientcompany"

# ============================================================================
# EXTERNAL URLS
# ============================================================================
NEXT_PUBLIC_APP_LOGIN_URL="https://app.clientdomain.com/login"
NEXT_PUBLIC_APP_SIGNUP_URL="https://app.clientdomain.com/signup"
NEXT_PUBLIC_ADMIN_LOGIN_URL="https://admin.clientdomain.com/login"

# ============================================================================
# FEATURE FLAGS
# ============================================================================
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT="true"
NEXT_PUBLIC_ENABLE_NEWSLETTER="true"
NEXT_PUBLIC_ENABLE_LIVE_CHAT="false"
NEXT_PUBLIC_ENABLE_BLOG="true"
NEXT_PUBLIC_ENABLE_CASE_STUDIES="true"
NEXT_PUBLIC_ENABLE_PRICING="true"
NEXT_PUBLIC_ENABLE_I18N="true"

# ============================================================================
# CONTACT FORM
# ============================================================================
CONTACT_WEBHOOK_URL="https://n8n.clientdomain.com/webhook/contact"
CONTACT_WEBHOOK_SECRET="<webhook-secret>"
CONTACT_FALLBACK_EMAIL="support@clientdomain.com"
```

### Step 3: Replace Branding Assets

**Files to replace:**

```bash
# Logo and favicon
public/logo.png              # Client logo
public/favicon.ico           # Client favicon
public/og-image.png          # Social sharing image
public/site.webmanifest      # Update with client info

# Placeholder images (optional)
public/placeholders/hero.jpg
public/placeholders/article.jpg
public/placeholders/avatar.jpg
```

### Step 4: Update Package Metadata

**File:** `package.json`

```json
{
  "name": "client-site-<client-name>",
  "version": "1.0.0",
  "description": "Production site for <Client Name>",
  "private": true
}
```

### Step 5: Customize Theme (Optional)

**File:** `config/theme.config.ts`

```typescript
// Override with client brand colors
const DEFAULT_COLORS: ThemeColors = {
  background: '#ffffff',
  foreground: '#0f172a',
  primary: '#CLIENT_PRIMARY_COLOR',
  primaryForeground: '#ffffff',
  accent: '#CLIENT_ACCENT_COLOR',
  // ... other colors
};
```

### Step 6: Configure Navigation

**File:** `template.config.json`

```json
{
  "template": "company-site",
  "designSystemVersion": "v1",
  "navigation": {
    "primary": [
      { "labelDocId": "nav-products", "slug": "/products" },
      { "labelDocId": "nav-solutions", "slug": "/solutions" },
      { "labelDocId": "nav-resources", "slug": "/resources" },
      { "labelDocId": "nav-about", "slug": "/about" },
      { "labelDocId": "nav-contact", "slug": "/contact" }
    ],
    "cta": { "labelDocId": "nav-cta", "slug": "/contact" }
  }
}
```

### Step 7: Update Translations

**Files:** `messages/*/common.json`, `messages/*/navigation.json`, etc.

```json
// messages/en/common.json
{
  "siteName": "Client Company Name",
  "siteTagline": "Client tagline here",
  "companyName": "Client Company Inc."
}

// messages/en/navigation.json
{
  "nav-products": "Products",
  "nav-solutions": "Solutions",
  "nav-cta": "Get Started"
}
```

### Step 8: Connect to Client CMS

1. Set up Payload CMS instance for client
2. Configure CMS collections
3. Import initial content
4. Test CMS connection

```bash
# Test CMS connection
curl https://cms.clientdomain.com/api/offers
```

### Step 9: Configure Analytics

1. Create Google Analytics property
2. Set up Facebook Pixel
3. Configure LinkedIn Insight Tag
4. Set up Hotjar (if needed)
5. Add tracking IDs to `.env.local`

### Step 10: Test Thoroughly

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Test all pages and features
# - Homepage
# - Offers/Products pages
# - Resources/Blog
# - Contact form
# - Analytics tracking (with consent)
# - Multi-language switching
# - Mobile responsiveness

# Build for production
pnpm build

# Test production build locally
pnpm start
```

### Step 11: Deploy to Production

```bash
# Set up hosting (Vercel, Netlify, etc.)
# Configure environment variables in hosting platform
# Deploy

# Example: Vercel
vercel --prod

# Or push to deployment branch
git remote add origin <client-repo>
git push -u origin main
```

### Step 12: Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test contact form submission
- [ ] Verify analytics tracking
- [ ] Test cookie consent banner
- [ ] Check SEO meta tags
- [ ] Verify social sharing images
- [ ] Test on mobile devices
- [ ] Check all external links
- [ ] Verify CMS content displays correctly
- [ ] Test multi-language switching (if enabled)

### Files to Modify (Client Site)

| File | Action | Required |
|------|--------|----------|
| `.env.local` | Configure all client settings | ✅ Required |
| `package.json` | Update name, version | ✅ Required |
| `public/logo.png` | Replace with client logo | ✅ Required |
| `public/favicon.ico` | Replace with client favicon | ✅ Required |
| `public/og-image.png` | Replace with client OG image | ✅ Required |
| `public/site.webmanifest` | Update with client info | ✅ Required |
| `template.config.json` | Configure navigation | ✅ Required |
| `messages/*/` | Update all translations | ✅ Required |
| `config/theme.config.ts` | Customize brand colors | ⚠️ Recommended |
| `public/placeholders/*` | Replace placeholder images | ⚠️ Optional |
| `README.md` | Update with client info | ⚠️ Optional |

### Files to NOT Modify (Unless Necessary)

| File | Reason |
|------|--------|
| `config/env.config.ts` | Core environment handling |
| `config/cms.config.ts` | CMS integration logic |
| `config/site.config.ts` | Use env vars instead |
| `src/lib/*` | Core functionality |
| `src/middleware.ts` | Core routing |
| `src/i18n.ts` | Internationalization |

---

## File Modification Matrix

### Legend

- ✅ **MUST UPDATE** - Required for proper functionality
- ⚠️ **SHOULD UPDATE** - Recommended for best results
- 🔧 **MAY CUSTOMIZE** - Optional customization
- 🚫 **DO NOT MODIFY** - Keep factory logic intact

### Master → Secondary Template

| File/Directory | Action | Notes |
|----------------|--------|-------|
| **Configuration** |||
| `package.json` | ✅ MUST UPDATE | Change name, description |
| `template.config.json` | ✅ MUST UPDATE | Set vertical defaults |
| `.env.example` | ✅ MUST UPDATE | Update example values |
| `config/theme.config.ts` | 🔧 MAY CUSTOMIZE | Vertical-specific colors |
| `config/site.config.ts` | 🔧 MAY CUSTOMIZE | Vertical-specific defaults |
| `config/env.config.ts` | 🚫 DO NOT MODIFY | Core env handling |
| `config/cms.config.ts` | 🚫 DO NOT MODIFY | CMS integration |
| **Documentation** |||
| `README.md` | ✅ MUST UPDATE | Vertical-specific docs |
| `docs/` | 🔧 MAY CUSTOMIZE | Add vertical guides |
| **Content** |||
| `messages/*/` | 🔧 MAY CUSTOMIZE | Vertical-specific copy |
| `src/lib/mockData/*` | 🔧 MAY CUSTOMIZE | Add vertical mock data |
| `data/cmsPayload.json` | 🔧 MAY CUSTOMIZE | Vertical CMS examples |
| **Assets** |||
| `public/logo.png` | 🔧 MAY CUSTOMIZE | Generic vertical logo |
| `public/placeholders/*` | 🔧 MAY CUSTOMIZE | Vertical-specific images |
| **Core Logic** |||
| `src/lib/analytics.ts` | 🚫 DO NOT MODIFY | Analytics system |
| `src/lib/forms/*` | 🚫 DO NOT MODIFY | Form handling |
| `src/middleware.ts` | 🚫 DO NOT MODIFY | Core routing |
| `src/i18n.ts` | 🚫 DO NOT MODIFY | i18n core |
| `src/lib/contentClient.ts` | 🚫 DO NOT MODIFY | CMS client |
| `src/lib/cmsStructureClient.ts` | 🚫 DO NOT MODIFY | CMS structure |

### Secondary Template → Client Site

| File/Directory | Action | Notes |
|----------------|--------|-------|
| **Configuration** |||
| `.env.local` | ✅ MUST UPDATE | All client settings |
| `package.json` | ✅ MUST UPDATE | Client name, version |
| `template.config.json` | ✅ MUST UPDATE | Client navigation |
| `config/theme.config.ts` | ⚠️ SHOULD UPDATE | Client brand colors |
| `config/env.config.ts` | 🚫 DO NOT MODIFY | Core env handling |
| **Branding** |||
| `public/logo.png` | ✅ MUST UPDATE | Client logo |
| `public/favicon.ico` | ✅ MUST UPDATE | Client favicon |
| `public/og-image.png` | ✅ MUST UPDATE | Client OG image |
| `public/site.webmanifest` | ✅ MUST UPDATE | Client PWA config |
| `public/placeholders/*` | ⚠️ SHOULD UPDATE | Client images |
| **Content** |||
| `messages/*/` | ✅ MUST UPDATE | All client copy |
| `data/cmsPayload.json` | 🔧 MAY CUSTOMIZE | Initial CMS data |
| **Documentation** |||
| `README.md` | ⚠️ SHOULD UPDATE | Client-specific docs |
| `docs/` | 🔧 MAY CUSTOMIZE | Client guides |
| **Core Logic** |||
| `config/site.config.ts` | 🚫 DO NOT MODIFY | Use env vars |
| `src/lib/*` | 🚫 DO NOT MODIFY | Core functionality |
| `src/middleware.ts` | 🚫 DO NOT MODIFY | Core routing |
| `src/components/*` | 🔧 MAY CUSTOMIZE | Client-specific UI |
| `src/layouts/*` | 🔧 MAY CUSTOMIZE | Client-specific layouts |

---

## Validation & Testing

### Pre-Deployment Validation

#### 1. Environment Variables Check

```bash
# Run validation script
node -e "
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const required = [
  'NEXT_PUBLIC_SITE_NAME',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_COMPANY_EMAIL'
];
const missing = required.filter(key => !env.includes(key));
if (missing.length > 0) {
  console.error('Missing required env vars:', missing);
  process.exit(1);
}
console.log('✅ All required env vars present');
"
```

#### 2. Build Test

```bash
# Clean build
rm -rf .next
pnpm build

# Should complete without errors
# Check for warnings about missing env vars
```

#### 3. Runtime Test

```bash
# Start production server
pnpm start

# Test critical paths
curl http://localhost:3000/en
curl http://localhost:3000/en/offers
curl http://localhost:3000/en/contact
```

#### 4. Analytics Test

```bash
# Run analytics validation script
node scripts/validate-analytics.js

# Should show which analytics providers are configured
```

#### 5. Feature Flags Test

Check that disabled features don't break the site:

```bash
# Test with features disabled
NEXT_PUBLIC_ENABLE_BLOG="false" pnpm dev
# Verify blog section is hidden but site works

NEXT_PUBLIC_ENABLE_PRICING="false" pnpm dev
# Verify pricing page is hidden but site works
```

### Post-Deployment Validation

#### 1. SEO Check

- [ ] Verify meta tags on all pages
- [ ] Check robots.txt accessibility
- [ ] Verify sitemap.xml generation
- [ ] Test social sharing (Twitter, Facebook, LinkedIn)

#### 2. Analytics Check

- [ ] Accept cookies on site
- [ ] Verify GA4 events in Real-Time report
- [ ] Check Facebook Pixel events (if configured)
- [ ] Verify LinkedIn Insight Tag (if configured)

#### 3. Performance Check

- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Check Core Web Vitals
- [ ] Test page load times
- [ ] Verify image optimization

#### 4. Accessibility Check

- [ ] Run axe DevTools scan
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify color contrast ratios

#### 5. Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Common Issues

#### Issue: Build fails with "Missing environment variable"

**Solution:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify required vars are set
cat .env.local | grep NEXT_PUBLIC_SITE_NAME
cat .env.local | grep NEXT_PUBLIC_SITE_URL

# Copy from example if missing
cp .env.example .env.local
```

#### Issue: Site shows "Company" instead of client name

**Solution:**
```bash
# Verify env var is set correctly
echo $NEXT_PUBLIC_SITE_NAME

# Ensure it's prefixed with NEXT_PUBLIC_ for client-side access
# Rebuild after changing env vars
rm -rf .next
pnpm build
```

#### Issue: Analytics not tracking

**Solution:**
1. Verify analytics IDs are set in `.env.local`
2. Accept cookies on the site
3. Check browser console for analytics logs
4. Verify IDs are correct format (e.g., `G-XXXXXXXXXX` for GA4)
5. Check that consent preferences are stored in localStorage

#### Issue: CMS content not loading

**Solution:**
```bash
# Test CMS connection
curl $NEXT_PUBLIC_PAYLOAD_API_URL/api/offers

# Verify CMS provider is set
echo $NEXT_PUBLIC_CMS_PROVIDER

# Check API key (server-side)
echo $PAYLOAD_API_KEY

# Fallback to mock data if CMS unavailable
NEXT_PUBLIC_CMS_PROVIDER="mock" pnpm dev
```

#### Issue: Images not loading

**Solution:**
1. Verify images exist in `public/` directory
2. Check image paths in code (should start with `/`)
3. Verify Next.js image optimization is working
4. Check browser console for 404 errors

#### Issue: Translations not working

**Solution:**
```bash
# Verify message files exist
ls messages/en/
ls messages/es/

# Check for JSON syntax errors
node -e "require('./messages/en/common.json')"

# Verify language is in SUPPORTED_LANGUAGES
grep SUPPORTED_LANGUAGES config/site.config.ts
```

### Getting Help

1. **Check Documentation**: Review `/docs` directory
2. **Check Completion Reports**: Review `AGENT_*_COMPLETE.md` files
3. **Check Config**: Review `config/README.md`
4. **Contact Factory Team**: Escalate if issue persists

---

## Appendix

### Quick Reference Commands

```bash
# Clone template
git clone <template-repo> <new-site-name>

# Setup
cd <new-site-name>
cp .env.example .env.local
pnpm install

# Development
pnpm dev

# Build
pnpm build
pnpm start

# Validate
node scripts/validate-analytics.js
```

### Environment Variable Quick Reference

See `docs/ENV_VARS_QUICK_REFERENCE.md` for complete list.

### CMS Quick Reference

See `docs/CMS_SCHEMA.md` for CMS structure.

### Analytics Quick Reference

See `docs/ANALYTICS_INTEGRATION_COMPLETE.md` for analytics setup.

---

**End of Playbook**
