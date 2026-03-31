# Environment Variables - Quick Reference

> **Quick start guide for environment variable configuration**  
> For detailed documentation, see [ENV_VARS_COMPLETE.md](./ENV_VARS_COMPLETE.md)

---

## Quick Start

### 1. Local Development

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with minimal config
NEXT_PUBLIC_SITE_NAME=My Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CMS_PROVIDER=mock
```

### 2. Start Development Server

```bash
npm run dev
```

---

## Usage in Code

### ✅ Correct Way

```typescript
import { ENV } from '@/config';

// Access any environment variable
const siteName = ENV.SITE.SITE_NAME;
const cmsProvider = ENV.CMS.PROVIDER;
const gaId = ENV.ANALYTICS.GA_MEASUREMENT_ID;
```

### ❌ Wrong Way

```typescript
// NEVER do this
const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
```

---

## Required Variables (Production)

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SITE_NAME` | `Acme Corp` |
| `NEXT_PUBLIC_SITE_URL` | `https://acme.com` |

---

## Common Configurations

### Mock CMS (Development)

```bash
NEXT_PUBLIC_CMS_PROVIDER=mock
```

### Payload CMS (Production)

```bash
NEXT_PUBLIC_CMS_PROVIDER=payload
NEXT_PUBLIC_PAYLOAD_API_URL=https://cms.acme.com
PAYLOAD_API_KEY=your-secret-key
```

### Analytics

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123XYZ
NEXT_PUBLIC_GTM_ID=GTM-ABC123
NEXT_PUBLIC_FB_PIXEL_ID=123456789
```

### Contact Form Webhook

```bash
CONTACT_WEBHOOK_URL=https://n8n.acme.com/webhook/contact
CONTACT_WEBHOOK_SECRET=your-secret-key
```

---

## Environment Groups

Access via `ENV.*`:

| Group | Variables | Example |
|-------|-----------|---------|
| `NEXT` | Node environment | `ENV.NEXT.NODE_ENV` |
| `SITE` | Site configuration | `ENV.SITE.SITE_NAME` |
| `CMS` | CMS configuration | `ENV.CMS.PROVIDER` |
| `THEME` | Theme settings | `ENV.THEME.DEFAULT_THEME` |
| `ANALYTICS` | Analytics IDs | `ENV.ANALYTICS.GA_MEASUREMENT_ID` |
| `SOCIAL` | Social media URLs | `ENV.SOCIAL.TWITTER_HANDLE` |
| `APP_URLS` | External app URLs | `ENV.APP_URLS.APP_LOGIN_URL` |
| `FEATURES` | Feature flags | `ENV.FEATURES.ENABLE_BLOG` |
| `CONTACT` | Contact form config | `ENV.CONTACT.WEBHOOK_URL` |
| `DATABASE` | Database config | `ENV.DATABASE.REDIS_URL` |

---

## Feature Flags

Enable/disable features:

```bash
# Enable (default)
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_CASE_STUDIES=true
NEXT_PUBLIC_ENABLE_PRICING=true
NEXT_PUBLIC_ENABLE_I18N=true

# Disable
NEXT_PUBLIC_ENABLE_LIVE_CHAT=false
```

---

## Security Rules

### Public Variables (NEXT_PUBLIC_*)

✅ Safe to expose:
- Site name, URL
- CMS provider type
- Analytics IDs
- Social media URLs
- Feature flags

### Private Variables (No prefix)

⚠️ Keep secret:
- API keys (`PAYLOAD_API_KEY`)
- Webhook secrets (`CONTACT_WEBHOOK_SECRET`)
- Database URLs (`REDIS_URL`)
- Fallback emails (`CONTACT_FALLBACK_EMAIL`)

---

## Troubleshooting

### Variables Not Updating

```bash
# Stop dev server (Ctrl+C)
# Restart
npm run dev
```

### Missing Variable Error

```bash
# Check .env.local exists
ls -la .env.local

# Check variable is set
cat .env.local | grep VARIABLE_NAME

# Check for typos in variable name
```

### CMS Connection Failed

```bash
# Verify CMS settings
echo $NEXT_PUBLIC_CMS_PROVIDER
echo $NEXT_PUBLIC_PAYLOAD_API_URL

# Test CMS endpoint
curl https://cms.acme.com/api/health
```

---

## Helper Functions

```typescript
import { 
  ENV,
  isProduction,
  isDevelopment,
  validateRequiredEnvVars 
} from '@/config';

// Check environment
if (isProduction()) {
  // Production-only code
}

if (isDevelopment()) {
  // Development-only code
}

// Validate required variables
validateRequiredEnvVars();
```

---

## Deployment Checklist

### Before Production Deploy

- [ ] All required variables set
- [ ] No `example.com` or generic values
- [ ] Strong secrets (32+ characters)
- [ ] Different secrets from staging
- [ ] Analytics IDs configured
- [ ] Webhook URL tested
- [ ] CMS connection verified
- [ ] Build succeeds locally

### Commands

```bash
# Test build
npm run build

# Type check
npx tsc --noEmit

# Deploy
vercel --prod
```

---

## File Locations

- **Config Source**: `config/env.config.ts`
- **Example File**: `.env.example`
- **Your Config**: `.env.local` (create this)
- **Full Docs**: `docs/ENV_VARS_COMPLETE.md`

---

## Need Help?

1. Check [ENV_VARS_COMPLETE.md](./ENV_VARS_COMPLETE.md) for detailed docs
2. Review `.env.example` for all variables
3. Check `config/env.config.ts` source code
4. Contact DevOps team

---

**Last Updated**: December 2024  
**Version**: 1.0.0
