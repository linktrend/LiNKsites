# Factory Cloning Quick Start Guide

**For:** Developers cloning the Master Template  
**Time:** 5-minute overview  
**Full Docs:** See `FACTORY_CLONING_PLAYBOOK.md` and `FACTORY_CLONING_CHECKLIST.md`

---

## 🎯 What is Factory Cloning?

The Master Template can be cloned at two levels:

1. **Master → Secondary Template** (Vertical/Industry-specific)
   - Creates reusable templates for specific industries
   - Remains brand-agnostic
   - Can be cloned multiple times

2. **Template → Client Site** (Production deployment)
   - Creates production sites for specific clients
   - Brand-specific configuration
   - Single-use deployment

---

## ⚡ Quick Clone: Client Site

### 1. Clone & Setup (2 minutes)

```bash
# Clone the template
git clone <template-repo> <client-name>
cd <client-name>

# Setup environment
cp .env.example .env.local
```

### 2. Configure Client (.env.local) (5 minutes)

```bash
# REQUIRED
NEXT_PUBLIC_SITE_NAME="Client Company Name"
NEXT_PUBLIC_SITE_URL="https://clientdomain.com"
NEXT_PUBLIC_COMPANY_EMAIL="hello@clientdomain.com"

# RECOMMENDED
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_CMS_PROVIDER="payload"
NEXT_PUBLIC_PAYLOAD_API_URL="https://cms.clientdomain.com"

# See .env.example for all options
```

### 3. Replace Branding (5 minutes)

```bash
# Replace these files:
public/logo.png              # Client logo
public/favicon.ico           # Client favicon
public/og-image.png          # Social sharing image
public/site.webmanifest      # Update with client info
```

### 4. Update Content (10 minutes)

```bash
# Update translation files:
messages/en/common.json      # Site name, tagline
messages/en/navigation.json  # Nav labels
messages/en/footer.json      # Footer content
messages/en/pages.json       # Page content

# Repeat for other languages if enabled
```

### 5. Test & Deploy (10 minutes)

```bash
# Install and test
pnpm install
pnpm dev

# Build for production
pnpm build
pnpm start

# Deploy
vercel --prod  # or your hosting platform
```

**Total Time:** ~30 minutes for basic setup

---

## 📋 Essential Checklists

### Pre-Deployment (Must Do)

- [ ] `.env.local` configured with all required vars
- [ ] Logo, favicon, and OG image replaced
- [ ] All translation files updated
- [ ] `template.config.json` navigation configured
- [ ] Test all pages load correctly
- [ ] Test contact form submission
- [ ] Build completes without errors

### Post-Deployment (Must Verify)

- [ ] Site accessible at production URL
- [ ] Analytics tracking (check GA4 Real-Time)
- [ ] Contact form working
- [ ] Cookie consent working
- [ ] SEO meta tags correct
- [ ] Social sharing works

---

## 🚫 What NOT to Modify

**DO NOT EDIT these files** (keep factory logic):

```
config/env.config.ts         # Core environment handling
config/cms.config.ts         # CMS integration
src/lib/analytics.ts         # Analytics system
src/lib/forms/*              # Form handling
src/middleware.ts            # Core routing
src/i18n.ts                  # Internationalization
```

**Instead:** Use environment variables and configuration files.

---

## 🔧 Common Customizations

### Change Brand Colors

**File:** `config/theme.config.ts`

```typescript
const DEFAULT_COLORS: ThemeColors = {
  primary: '#YOUR_PRIMARY_COLOR',
  accent: '#YOUR_ACCENT_COLOR',
  // ... other colors
};
```

### Change Navigation

**File:** `template.config.json`

```json
{
  "navigation": {
    "primary": [
      { "labelDocId": "nav-products", "slug": "/products" },
      { "labelDocId": "nav-about", "slug": "/about" }
    ]
  }
}
```

### Disable Features

**File:** `.env.local`

```bash
NEXT_PUBLIC_ENABLE_BLOG="false"
NEXT_PUBLIC_ENABLE_PRICING="false"
NEXT_PUBLIC_ENABLE_I18N="false"
```

---

## 🆘 Troubleshooting

### Site shows "Company" instead of client name

**Fix:** Set `NEXT_PUBLIC_SITE_NAME` in `.env.local` and rebuild

```bash
rm -rf .next
pnpm build
```

### Analytics not tracking

**Fix:** 
1. Set analytics IDs in `.env.local`
2. Accept cookies on the site
3. Verify IDs are correct format (e.g., `G-XXXXXXXXXX`)

### CMS content not loading

**Fix:** Verify CMS URL and API key, or use mock data:

```bash
NEXT_PUBLIC_CMS_PROVIDER="mock" pnpm dev
```

### Build fails

**Fix:** Check all required env vars are set:

```bash
cat .env.local | grep NEXT_PUBLIC_SITE_NAME
cat .env.local | grep NEXT_PUBLIC_SITE_URL
```

---

## 📚 Full Documentation

For complete details, see:

- **FACTORY_CLONING_PLAYBOOK.md** - Complete procedures (22KB)
- **FACTORY_CLONING_CHECKLIST.md** - Validation checklists (19KB)
- **AGENT_21_FACTORY_CLONING_COMPLETE.md** - Verification report

---

## 💡 Pro Tips

1. **Use the checklist** - Don't skip validation steps
2. **Test locally first** - Always test production build before deploying
3. **Keep it simple** - Use env vars instead of modifying core files
4. **Document changes** - Note any customizations you make
5. **Follow the playbook** - Step-by-step procedures save time

---

## ✅ Template Status

**CERTIFIED: READY FOR CLONING** ✅

- ✅ No hardcoded brand names
- ✅ No hardcoded domains
- ✅ All services configurable
- ✅ Graceful degradation
- ✅ Production tested

---

**Need Help?** See full documentation or contact the factory team.

**Last Updated:** December 2024  
**Template Version:** 1.0.0
