# Factory Cloning Checklist

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Purpose:** Comprehensive checklist for cloning Master Template to Secondary Templates or Client Sites

---

## Table of Contents

1. [Master Template Readiness Checklist](#master-template-readiness-checklist)
2. [Secondary Template Cloning Checklist](#secondary-template-cloning-checklist)
3. [Client Site Cloning Checklist](#client-site-cloning-checklist)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Coupling Risk Assessment](#coupling-risk-assessment)

---

## Master Template Readiness Checklist

Use this checklist to verify the Master Template is ready for cloning.

### ✅ Brand Decoupling

- [ ] No hardcoded brand names in code (uses `getSiteName()` or env vars)
- [ ] No hardcoded domain names (uses `NEXT_PUBLIC_SITE_URL`)
- [ ] No hardcoded email addresses (uses `NEXT_PUBLIC_COMPANY_EMAIL`)
- [ ] No hardcoded phone numbers (uses `NEXT_PUBLIC_COMPANY_PHONE`)
- [ ] No hardcoded social media handles (uses env vars)
- [ ] Mock data uses dynamic site name from config
- [ ] Help articles use template variables instead of "LinkTrend"

### ✅ Configuration Consolidation

- [ ] All environment variables defined in `config/env.config.ts`
- [ ] Site configuration centralized in `config/site.config.ts`
- [ ] Theme configuration centralized in `config/theme.config.ts`
- [ ] CMS configuration centralized in `config/cms.config.ts`
- [ ] No direct `process.env` access in application code
- [ ] All config exports through `config/index.ts`

### ✅ Feature Flexibility

- [ ] Analytics can be disabled via env vars
- [ ] Cookie consent can be disabled via feature flag
- [ ] Newsletter can be disabled via feature flag
- [ ] Blog/Resources can be disabled via feature flag
- [ ] Case studies can be disabled via feature flag
- [ ] Pricing page can be disabled via feature flag
- [ ] Multi-language can be disabled via feature flag
- [ ] Live chat can be disabled via feature flag

### ✅ Graceful Degradation

- [ ] Site works without analytics configured
- [ ] Site works without CMS connected (uses mock data)
- [ ] Site works without contact webhook configured
- [ ] Forms have fallback error handling
- [ ] Images have fallback placeholders
- [ ] Analytics scripts have try-catch error handling
- [ ] CMS client has error handling and fallbacks

### ✅ Industry/Vertical Neutrality

- [ ] No industry-specific terminology in core components
- [ ] No vertical-specific assumptions in layouts
- [ ] Navigation structure is configurable
- [ ] Page templates are generic and reusable
- [ ] Content types are flexible (offers, resources, etc.)
- [ ] No hardcoded industry-specific features

### ✅ Environment Agnostic

- [ ] No hardcoded localhost URLs in production code
- [ ] No hardcoded API endpoints (uses env vars)
- [ ] No hardcoded external service URLs
- [ ] Development/staging/production configs separated
- [ ] All external URLs configurable via env vars

### ✅ Documentation

- [ ] README.md is up to date
- [ ] Configuration documentation exists (`config/README.md`)
- [ ] Environment variables documented (`docs/ENV_VARS_QUICK_REFERENCE.md`)
- [ ] CMS schema documented (`docs/CMS_SCHEMA.md`)
- [ ] Analytics setup documented
- [ ] Migration guide exists
- [ ] Cloning playbook exists

### ✅ Code Quality

- [ ] TypeScript strict mode enabled
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] No linter errors
- [ ] Build completes successfully
- [ ] All pages render without errors
- [ ] Tests pass (if tests exist)

### ✅ Asset Management

- [ ] Generic placeholder images in `public/placeholders/`
- [ ] No client-specific images in public directory
- [ ] Logo is generic or placeholder
- [ ] Favicon is generic or placeholder
- [ ] OG image is generic or placeholder

---

## Secondary Template Cloning Checklist

Use this checklist when creating a vertical/industry-specific template.

### 📋 Pre-Cloning

- [ ] Identify target vertical/industry
- [ ] Define vertical-specific requirements
- [ ] Plan vertical-specific defaults
- [ ] Prepare vertical-specific documentation
- [ ] Create repository for secondary template

### 📋 Repository Setup

- [ ] Clone master template to new directory
- [ ] Remove or reset git history
- [ ] Initialize new git repository
- [ ] Create initial commit
- [ ] Add remote repository
- [ ] Push to remote

### 📋 Configuration Updates

- [ ] Update `package.json` name to `company-site-template-<vertical>`
- [ ] Update `package.json` description
- [ ] Update `template.config.json` template name
- [ ] Configure vertical-specific navigation defaults
- [ ] Update `.env.example` with vertical defaults
- [ ] Add vertical identifier if needed

### 📋 Theme Customization (Optional)

- [ ] Define vertical-specific brand colors
- [ ] Update `config/theme.config.ts` with color overrides
- [ ] Test theme in light and dark modes
- [ ] Verify color contrast ratios
- [ ] Update gradient definitions if needed

### 📋 Content Customization (Optional)

- [ ] Add vertical-specific mock data
- [ ] Update translation files with vertical terminology
- [ ] Add vertical-specific CMS schema examples
- [ ] Update navigation labels for vertical
- [ ] Add vertical-specific placeholder images

### 📋 Documentation Updates

- [ ] Update `README.md` title and description
- [ ] Add vertical-specific setup instructions
- [ ] Document vertical-specific features
- [ ] Update examples to match vertical
- [ ] Add vertical-specific use cases
- [ ] Document any custom configurations

### 📋 Testing

- [ ] Install dependencies successfully
- [ ] Development server runs without errors
- [ ] All pages render correctly
- [ ] Build completes successfully
- [ ] Production build runs correctly
- [ ] No console errors
- [ ] No TypeScript errors

### 📋 Version Control

- [ ] Tag initial version (v0.1.0)
- [ ] Push tags to remote
- [ ] Create release notes
- [ ] Document changelog

### 📋 Validation

- [ ] Template can be cloned for client sites
- [ ] No hardcoded vertical-specific data in core logic
- [ ] Template maintains factory structure
- [ ] Configuration is still flexible
- [ ] Can be customized further for clients

---

## Client Site Cloning Checklist

Use this checklist when creating a production site for a specific client.

### 📋 Pre-Cloning

- [ ] Gather client requirements
- [ ] Collect client branding assets (logo, colors, fonts)
- [ ] Collect client content (copy, images, videos)
- [ ] Obtain client analytics tracking IDs
- [ ] Set up client CMS instance (if using CMS)
- [ ] Configure client domain and hosting
- [ ] Create repository for client site

### 📋 Repository Setup

- [ ] Clone template to client site directory
- [ ] Remove or reset git history
- [ ] Initialize new git repository
- [ ] Create initial commit
- [ ] Add remote repository
- [ ] Push to remote

### 📋 Environment Configuration

- [ ] Create `.env.local` from `.env.example`
- [ ] Set `NEXT_PUBLIC_SITE_NAME` to client name
- [ ] Set `NEXT_PUBLIC_SITE_URL` to client domain
- [ ] Set `NEXT_PUBLIC_COMPANY_LEGAL_NAME`
- [ ] Set `NEXT_PUBLIC_COMPANY_EMAIL`
- [ ] Set `NEXT_PUBLIC_COMPANY_PHONE`
- [ ] Configure `NEXT_PUBLIC_DEFAULT_THEME`
- [ ] Set `NEXT_PUBLIC_ALLOW_THEME_SWITCHING`

### 📋 CMS Configuration

- [ ] Set `NEXT_PUBLIC_CMS_PROVIDER` to "payload" or "mock"
- [ ] Set `NEXT_PUBLIC_PAYLOAD_API_URL`
- [ ] Set `PAYLOAD_API_KEY` (server-side)
- [ ] Test CMS connection
- [ ] Import initial content to CMS
- [ ] Verify CMS collections are populated

### 📋 Analytics Configuration

- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (Google Analytics)
- [ ] Set `NEXT_PUBLIC_GTM_ID` (Google Tag Manager, optional)
- [ ] Set `NEXT_PUBLIC_FB_PIXEL_ID` (Facebook Pixel, optional)
- [ ] Set `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` (LinkedIn, optional)
- [ ] Set `NEXT_PUBLIC_HOTJAR_ID` (Hotjar, optional)
- [ ] Set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` (Custom, optional)

### 📋 Social Media Configuration

- [ ] Set `NEXT_PUBLIC_TWITTER_HANDLE`
- [ ] Set `NEXT_PUBLIC_LINKEDIN_URL`
- [ ] Set `NEXT_PUBLIC_FACEBOOK_URL`
- [ ] Set `NEXT_PUBLIC_INSTAGRAM_URL`
- [ ] Set `NEXT_PUBLIC_YOUTUBE_URL`

### 📋 External URLs Configuration

- [ ] Set `NEXT_PUBLIC_APP_LOGIN_URL`
- [ ] Set `NEXT_PUBLIC_APP_SIGNUP_URL`
- [ ] Set `NEXT_PUBLIC_ADMIN_LOGIN_URL`
- [ ] Set `NEXT_PUBLIC_SUPPORT_URL`
- [ ] Set `NEXT_PUBLIC_DOCS_URL`
- [ ] Set `NEXT_PUBLIC_API_URL` (if separate API)

### 📋 Feature Flags Configuration

- [ ] Set `NEXT_PUBLIC_ENABLE_COOKIE_CONSENT`
- [ ] Set `NEXT_PUBLIC_ENABLE_NEWSLETTER`
- [ ] Set `NEXT_PUBLIC_ENABLE_LIVE_CHAT`
- [ ] Set `NEXT_PUBLIC_ENABLE_BLOG`
- [ ] Set `NEXT_PUBLIC_ENABLE_CASE_STUDIES`
- [ ] Set `NEXT_PUBLIC_ENABLE_PRICING`
- [ ] Set `NEXT_PUBLIC_ENABLE_I18N`

### 📋 Contact Form Configuration

- [ ] Set `CONTACT_WEBHOOK_URL`
- [ ] Set `CONTACT_WEBHOOK_SECRET`
- [ ] Set `CONTACT_FALLBACK_EMAIL`
- [ ] Test webhook endpoint
- [ ] Test form submission

### 📋 Branding Assets

- [ ] Replace `public/logo.png` with client logo
- [ ] Replace `public/favicon.ico` with client favicon
- [ ] Replace `public/og-image.png` with client OG image
- [ ] Update `public/site.webmanifest` with client info
- [ ] Replace `public/placeholders/hero.jpg` (optional)
- [ ] Replace `public/placeholders/article.jpg` (optional)
- [ ] Replace `public/placeholders/avatar.jpg` (optional)

### 📋 Theme Customization

- [ ] Update `config/theme.config.ts` with client brand colors
- [ ] Test primary color contrast
- [ ] Test accent color contrast
- [ ] Verify theme works in light mode
- [ ] Verify theme works in dark mode (if enabled)
- [ ] Test gradients and shadows

### 📋 Navigation Configuration

- [ ] Update `template.config.json` navigation structure
- [ ] Configure primary navigation items
- [ ] Configure CTA button
- [ ] Update legal page mappings
- [ ] Test navigation on all pages

### 📋 Content Updates

- [ ] Update `messages/en/common.json` with client copy
- [ ] Update `messages/en/navigation.json` with nav labels
- [ ] Update `messages/en/footer.json` with footer content
- [ ] Update `messages/en/pages.json` with page content
- [ ] Repeat for all enabled languages (es, zh-tw, zh-cn)
- [ ] Verify all translation keys are populated

### 📋 Package Metadata

- [ ] Update `package.json` name to `client-site-<client-name>`
- [ ] Update `package.json` version to 1.0.0
- [ ] Update `package.json` description
- [ ] Verify dependencies are up to date

### 📋 Documentation Updates

- [ ] Update `README.md` with client info (optional)
- [ ] Add client-specific setup instructions (optional)
- [ ] Document custom features (optional)
- [ ] Add deployment instructions (optional)

---

## Pre-Deployment Checklist

Use this checklist before deploying to production.

### 🚀 Build & Test

- [ ] Run `pnpm install` successfully
- [ ] Run `pnpm dev` without errors
- [ ] Test all pages in development mode
- [ ] Run `pnpm build` successfully
- [ ] No build warnings about missing env vars
- [ ] Run `pnpm start` successfully
- [ ] Test all pages in production mode

### 🚀 Environment Validation

- [ ] All required env vars are set
- [ ] No `example.com` URLs in env vars
- [ ] No placeholder values in env vars
- [ ] Analytics IDs are correct format
- [ ] CMS URL is accessible
- [ ] Webhook URLs are accessible
- [ ] External URLs are valid

### 🚀 Content Validation

- [ ] All pages have proper content
- [ ] No "Lorem ipsum" placeholder text
- [ ] All images load correctly
- [ ] No broken image links
- [ ] All internal links work
- [ ] All external links work

### 🚀 Functionality Testing

- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Language switcher works (if enabled)
- [ ] Contact form submits successfully
- [ ] Contact form validation works
- [ ] Newsletter signup works (if enabled)
- [ ] Cookie consent banner appears
- [ ] Cookie preferences can be saved
- [ ] Cookie preferences can be changed

### 🚀 Analytics Testing

- [ ] Accept cookies on site
- [ ] Verify analytics scripts load in browser DevTools
- [ ] Check GA4 Real-Time report shows activity
- [ ] Test custom event tracking (if implemented)
- [ ] Verify Facebook Pixel events (if configured)
- [ ] Verify LinkedIn tracking (if configured)
- [ ] Test analytics with consent revoked

### 🚀 SEO Validation

- [ ] All pages have unique titles
- [ ] All pages have meta descriptions
- [ ] All pages have proper OG tags
- [ ] All pages have proper Twitter Card tags
- [ ] Canonical URLs are correct
- [ ] Hreflang tags are correct (if multi-language)
- [ ] Robots.txt is accessible
- [ ] Sitemap.xml is generated
- [ ] Structured data is valid (if implemented)

### 🚀 Performance Testing

- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Check First Contentful Paint (FCP)
- [ ] Check Largest Contentful Paint (LCP)
- [ ] Check Cumulative Layout Shift (CLS)
- [ ] Check Time to Interactive (TTI)
- [ ] Verify images are optimized
- [ ] Verify fonts are optimized

### 🚀 Accessibility Testing

- [ ] Run axe DevTools scan (0 violations)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify color contrast ratios (WCAG AA)
- [ ] Verify focus indicators are visible
- [ ] Verify form labels are proper
- [ ] Verify ARIA attributes are correct

### 🚀 Cross-Browser Testing

- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Test in iOS Safari (mobile)
- [ ] Test in Chrome Mobile (Android)

### 🚀 Responsive Testing

- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px width)
- [ ] Test on large desktop (1920px width)
- [ ] Verify no horizontal scroll
- [ ] Verify touch targets are adequate (44px min)

### 🚀 Security Checks

- [ ] No sensitive data in client-side code
- [ ] No API keys exposed in client-side code
- [ ] HTTPS is enforced (in production)
- [ ] Security headers are configured
- [ ] Content Security Policy is configured (if needed)
- [ ] Rate limiting is configured (if needed)

---

## Post-Deployment Checklist

Use this checklist after deploying to production.

### ✅ Deployment Verification

- [ ] Site is accessible at production URL
- [ ] HTTPS is working correctly
- [ ] SSL certificate is valid
- [ ] DNS is configured correctly
- [ ] CDN is configured correctly (if using)
- [ ] Environment variables are set in hosting platform

### ✅ Functionality Verification

- [ ] Homepage loads correctly
- [ ] All pages are accessible
- [ ] Navigation works correctly
- [ ] Contact form submits successfully
- [ ] Form submissions reach destination (webhook/email)
- [ ] Language switching works (if enabled)
- [ ] Cookie consent works correctly

### ✅ Analytics Verification

- [ ] GA4 is receiving data (check Real-Time report)
- [ ] Facebook Pixel is firing (check Events Manager)
- [ ] LinkedIn tracking is working (check Campaign Manager)
- [ ] Hotjar is recording (check Dashboard)
- [ ] Custom analytics endpoint is receiving data (if configured)

### ✅ SEO Verification

- [ ] Google Search Console is set up
- [ ] Sitemap submitted to Google Search Console
- [ ] Bing Webmaster Tools is set up (optional)
- [ ] Robots.txt is accessible
- [ ] Social sharing works correctly (test on Twitter, Facebook, LinkedIn)
- [ ] Rich snippets are displaying correctly (if implemented)

### ✅ Performance Verification

- [ ] Run Lighthouse audit on production URL
- [ ] Check Core Web Vitals in Google Search Console
- [ ] Verify page load times are acceptable
- [ ] Check for any performance regressions

### ✅ Monitoring Setup

- [ ] Set up uptime monitoring (Pingdom, UptimeRobot, etc.)
- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Set up performance monitoring (if needed)
- [ ] Configure alerting for downtime
- [ ] Configure alerting for errors

### ✅ Documentation

- [ ] Document deployment process
- [ ] Document environment variables
- [ ] Document any custom configurations
- [ ] Document maintenance procedures
- [ ] Share access credentials with client (securely)

### ✅ Client Handoff

- [ ] Provide client with admin access (CMS, analytics, etc.)
- [ ] Provide client with documentation
- [ ] Train client on CMS usage (if applicable)
- [ ] Train client on analytics dashboard
- [ ] Provide support contact information

---

## Coupling Risk Assessment

Use this section to identify potential coupling risks before cloning.

### 🔍 Brand Coupling Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hardcoded brand name in code | 🔴 High | Use `getSiteName()` or env vars |
| Hardcoded domain in code | 🔴 High | Use `NEXT_PUBLIC_SITE_URL` |
| Hardcoded email addresses | 🟡 Medium | Use `NEXT_PUBLIC_COMPANY_EMAIL` |
| Brand-specific mock data | 🟡 Medium | Use dynamic site name variables |
| Brand-specific images | 🟢 Low | Replace during client cloning |

### 🔍 Infrastructure Coupling Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hardcoded API endpoints | 🔴 High | Use env vars for all endpoints |
| Hardcoded CMS URLs | 🔴 High | Use `NEXT_PUBLIC_PAYLOAD_API_URL` |
| Hardcoded webhook URLs | 🟡 Medium | Use `CONTACT_WEBHOOK_URL` |
| Hardcoded analytics IDs | 🟡 Medium | Use `NEXT_PUBLIC_GA_MEASUREMENT_ID` etc. |
| Hardcoded external service URLs | 🟡 Medium | Use env vars for all external URLs |

### 🔍 Feature Coupling Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Required analytics | 🟡 Medium | Make analytics optional with feature flags |
| Required CMS connection | 🟡 Medium | Provide mock data fallback |
| Required external services | 🟡 Medium | Implement graceful degradation |
| Hardcoded feature set | 🟢 Low | Use feature flags for all optional features |

### 🔍 Industry/Vertical Coupling Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Industry-specific terminology | 🟡 Medium | Use generic terms or make configurable |
| Vertical-specific components | 🟡 Medium | Make components generic and reusable |
| Industry-specific workflows | 🟡 Medium | Make workflows configurable |
| Vertical-specific assumptions | 🟢 Low | Document assumptions and make overridable |

### 🔍 Content Coupling Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hardcoded content in components | 🔴 High | Move content to translation files |
| Hardcoded navigation structure | 🟡 Medium | Use `template.config.json` |
| Hardcoded page structure | 🟡 Medium | Make layouts configurable |
| Hardcoded legal content | 🟢 Low | Move to CMS or translation files |

---

## Risk Severity Legend

- 🔴 **High Risk**: Will break cloning process or cause major issues
- 🟡 **Medium Risk**: May cause issues or require significant rework
- 🟢 **Low Risk**: Minor issues or easy to fix

---

## Checklist Status

### Master Template Status: ✅ READY FOR CLONING

**Last Verified:** December 2024

**Verification Results:**
- ✅ No hardcoded brand names (uses `getSiteName()`)
- ✅ No hardcoded domains (uses env vars)
- ✅ Configuration consolidated in `/config`
- ✅ Feature flags implemented
- ✅ Graceful degradation implemented
- ✅ Industry/vertical neutral
- ✅ Environment agnostic
- ✅ Documentation complete

**Known Issues:** None

**Recommendations:**
1. Use this checklist for every cloning operation
2. Update checklist as template evolves
3. Document any deviations from standard process
4. Keep coupling risk assessment up to date

---

**End of Checklist**
