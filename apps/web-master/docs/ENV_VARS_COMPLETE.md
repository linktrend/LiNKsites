# Environment Variables - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Variables Reference](#environment-variables-reference)
4. [Configuration by Deployment Type](#configuration-by-deployment-type)
5. [Local Development Setup](#local-development-setup)
6. [Staging Environment](#staging-environment)
7. [Production Environment](#production-environment)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The LinkTrend Master Template uses a centralized environment variable configuration system that provides:

- **Type Safety**: All environment variables are accessed through typed configuration objects
- **Single Source of Truth**: All env vars are defined in `config/env.config.ts`
- **Validation**: Required variables are validated at startup
- **Clear Documentation**: Each variable is documented with purpose and format
- **Graceful Degradation**: Optional variables have sensible defaults

### Key Principles

1. **Never access `process.env` directly** in application code
2. **Always use `ENV` from `@/config`** for environment variables
3. **Prefix with `NEXT_PUBLIC_`** only for browser-safe values
4. **Keep secrets private** (no `NEXT_PUBLIC_` prefix)
5. **Document all variables** in `.env.example`

---

## Architecture

### Configuration Layer Structure

```
config/
├── env.config.ts       # Environment variables (centralized)
├── site.config.ts      # Site configuration (uses ENV)
├── theme.config.ts     # Theme configuration (uses ENV)
├── cms.config.ts       # CMS configuration (uses ENV)
└── index.ts            # Central export point
```

### Usage Pattern

```typescript
// ❌ BAD: Direct process.env access
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// ✅ GOOD: Use centralized ENV config
import { ENV } from '@/config';
const siteUrl = ENV.SITE.SITE_URL;
```

### Environment Variable Flow

```
.env.local → process.env → config/env.config.ts → config/*.config.ts → Application Code
```

---

## Environment Variables Reference

### Next.js Environment

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | Server | `development` | Node environment (development, production, test) |
| `__NEXT_BUILD_ID` | Server | Auto-generated | Next.js build identifier |

**Access via**: `ENV.NEXT.NODE_ENV`, `ENV.NEXT.BUILD_ID`

---

### Site Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_NAME` | Public | ✅ Production | `Company` | Site name/brand displayed to users |
| `NEXT_PUBLIC_SITE_URL` | Public | ✅ Production | `https://example.com` | Full site URL for SEO and absolute links |
| `NEXT_PUBLIC_COMPANY_LEGAL_NAME` | Public | ❌ | `Company Inc.` | Legal company name for footer/legal pages |
| `NEXT_PUBLIC_COMPANY_EMAIL` | Public | ❌ | `hello@example.com` | Company contact email |
| `NEXT_PUBLIC_COMPANY_PHONE` | Public | ❌ | `""` | Company phone number |
| `SITE_ID` | Server | ❌ | `""` | Site identifier for multi-site deployments |

**Access via**: `ENV.SITE.*`

**Required for Production**:
- `NEXT_PUBLIC_SITE_NAME` - Must not be "Company" or generic
- `NEXT_PUBLIC_SITE_URL` - Must not contain "example.com"

**Example**:
```bash
NEXT_PUBLIC_SITE_NAME="Acme Corp"
NEXT_PUBLIC_SITE_URL="https://acme.com"
NEXT_PUBLIC_COMPANY_LEGAL_NAME="Acme Corporation"
NEXT_PUBLIC_COMPANY_EMAIL="contact@acme.com"
```

---

### CMS Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_CMS_PROVIDER` | Public | ❌ | `mock` | CMS provider: `payload` or `mock` |
| `PAYLOAD_PUBLIC_SERVER_URL` | Public | ⚠️ Payload | `http://localhost:3000` | Payload CMS server URL (client-side) |
| `NEXT_PUBLIC_PAYLOAD_API_URL` | Public | ⚠️ Payload | `http://localhost:3000` | Payload CMS API URL (client-side) |
| `PAYLOAD_API_KEY` | Server | ⚠️ Payload | `""` | Payload CMS API key (server-side auth) |

**Access via**: `ENV.CMS.*`

**CMS Provider Options**:
- `mock` - Use local JSON data from `data/cmsPayload.json` (development)
- `payload` - Connect to Payload CMS instance (staging/production)

**Example (Mock Mode)**:
```bash
NEXT_PUBLIC_CMS_PROVIDER=mock
```

**Example (Payload Mode)**:
```bash
NEXT_PUBLIC_CMS_PROVIDER=payload
PAYLOAD_PUBLIC_SERVER_URL=https://cms.acme.com
NEXT_PUBLIC_PAYLOAD_API_URL=https://cms.acme.com
PAYLOAD_API_KEY=your-secret-api-key-here
```

---

### Theme Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_DEFAULT_THEME` | Public | ❌ | `default` | Default theme variant |
| `NEXT_PUBLIC_ALLOW_THEME_SWITCHING` | Public | ❌ | `true` | Allow users to switch themes |
| `DEFAULT_THEME_ID` | Server | ❌ | `default` | Legacy theme ID support |

**Access via**: `ENV.THEME.*`

**Theme Variants**:
- `default` - Default light theme
- `light` - Alias for default
- `dark` - Dark mode theme
- `accent` - Accent/branded theme

**Example**:
```bash
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_ALLOW_THEME_SWITCHING=true
```

---

### Analytics & Tracking

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Public | ❌ | `""` | Google Analytics 4 Measurement ID |
| `NEXT_PUBLIC_GTM_ID` | Public | ❌ | `""` | Google Tag Manager Container ID |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Public | ❌ | `""` | Facebook Pixel ID |
| `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` | Public | ❌ | `""` | LinkedIn Insight Tag Partner ID |
| `NEXT_PUBLIC_HOTJAR_ID` | Public | ❌ | `""` | Hotjar Site ID |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | Public | ❌ | `""` | Custom analytics endpoint URL |

**Access via**: `ENV.ANALYTICS.*`

**Format Requirements**:
- Google Analytics: `G-XXXXXXXXXX`
- Google Tag Manager: `GTM-XXXXXXX`
- Facebook Pixel: Numeric ID
- LinkedIn: Numeric ID
- Hotjar: Numeric ID

**Privacy Compliance**:
- All analytics scripts respect cookie consent
- Scripts only load after user accepts tracking cookies
- See `CookieConsentBanner.tsx` for implementation

**Example**:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123XYZ
NEXT_PUBLIC_GTM_ID=GTM-ABC123
NEXT_PUBLIC_FB_PIXEL_ID=123456789
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=987654
NEXT_PUBLIC_HOTJAR_ID=3456789
```

---

### Social Media

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_TWITTER_HANDLE` | Public | ❌ | `@company` | Twitter/X handle (with @) |
| `NEXT_PUBLIC_LINKEDIN_URL` | Public | ❌ | `""` | LinkedIn company page URL |
| `NEXT_PUBLIC_FACEBOOK_URL` | Public | ❌ | `""` | Facebook page URL |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Public | ❌ | `""` | Instagram profile URL |
| `NEXT_PUBLIC_YOUTUBE_URL` | Public | ❌ | `""` | YouTube channel URL |

**Access via**: `ENV.SOCIAL.*`

**Example**:
```bash
NEXT_PUBLIC_TWITTER_HANDLE=@acmecorp
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/acme
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/acmecorp
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/acmecorp
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@acmecorp
```

---

### External Application URLs

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_LOGIN_URL` | Public | ❌ | `https://app.example.com/login` | Main app login URL |
| `NEXT_PUBLIC_APP_SIGNUP_URL` | Public | ❌ | `https://app.example.com/signup` | Main app signup URL |
| `NEXT_PUBLIC_ADMIN_LOGIN_URL` | Public | ❌ | `https://admin.example.com/login` | Admin dashboard login URL |
| `NEXT_PUBLIC_SUPPORT_URL` | Public | ❌ | `""` | Support portal URL |
| `NEXT_PUBLIC_DOCS_URL` | Public | ❌ | `""` | Documentation URL |
| `NEXT_PUBLIC_API_URL` | Public | ❌ | `""` | API base URL (if separate) |

**Access via**: `ENV.APP_URLS.*`

**Example**:
```bash
NEXT_PUBLIC_APP_LOGIN_URL=https://app.acme.com/login
NEXT_PUBLIC_APP_SIGNUP_URL=https://app.acme.com/signup
NEXT_PUBLIC_ADMIN_LOGIN_URL=https://admin.acme.com
NEXT_PUBLIC_SUPPORT_URL=https://support.acme.com
NEXT_PUBLIC_DOCS_URL=https://docs.acme.com
```

---

### Feature Flags

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_ENABLE_COOKIE_CONSENT` | Public | ❌ | `true` | Show cookie consent banner |
| `NEXT_PUBLIC_ENABLE_NEWSLETTER` | Public | ❌ | `true` | Enable newsletter signup |
| `NEXT_PUBLIC_ENABLE_LIVE_CHAT` | Public | ❌ | `false` | Enable live chat widget |
| `NEXT_PUBLIC_ENABLE_BLOG` | Public | ❌ | `true` | Enable blog/resources section |
| `NEXT_PUBLIC_ENABLE_CASE_STUDIES` | Public | ❌ | `true` | Enable case studies section |
| `NEXT_PUBLIC_ENABLE_PRICING` | Public | ❌ | `true` | Enable pricing page |
| `NEXT_PUBLIC_ENABLE_I18N` | Public | ❌ | `true` | Enable internationalization |

**Access via**: `ENV.FEATURES.*`

**Boolean Logic**:
- Set to `false` to explicitly disable
- Omit or set to `true` to enable
- Any value except `false` is treated as enabled

**Example**:
```bash
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=false
NEXT_PUBLIC_ENABLE_BLOG=true
```

---

### Contact Form & Governed LiNKautowork

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LINKAUTOWORK_GATEWAY_URL` | Server | ⚠️ Production | `""` | Governed signed event gateway |
| `LINKAUTOWORK_SIGNING_SECRET` | Server | ⚠️ Production | `""` | Secret-manager signing secret |
| `LINKAUTOWORK_EVENT_GRANTS` | Server | ⚠️ Production | `[]` | Explicit event/org/environment grants |
| `LINKAUTOWORK_OUTBOX_PATH` | Server | ⚠️ Production | `""` | Durable recoverable outbox |
| `LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET` | Server | ⚠️ Production | `""` | Separate secret for queue integrity framing |
| `CONTACT_FORM_ENDPOINT` | Server | ❌ | `/api/contact` | Contact form API endpoint |

**Access via**: `ENV.CONTACT.*`

**⚠️ SECURITY WARNING**: These are server-only variables. Never prefix with `NEXT_PUBLIC_`.

**Governed Integration**:
- Contact submissions are signed `contact.submitted` events
- A durable worker retries and requires a valid gateway receipt

**Example**:
```bash
LINKAUTOWORK_GATEWAY_URL=https://gateway.acme.example/events
LINKAUTOWORK_SIGNING_SECRET=<secret-manager-reference>
LINKAUTOWORK_EVENT_GRANTS='[{"eventName":"contact.submitted","environments":["production"],"orgIds":["<org-id>"]}]'
LINKAUTOWORK_OUTBOX_PATH=/var/lib/linksites/linkautowork-outbox.json
LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET=<separate-secret-manager-reference>
```

**Example (Development)**:
```bash
# Leave the governed gateway configuration empty only when the form is disabled
LINKAUTOWORK_GATEWAY_URL=
```

---

### AI & Machine Experience

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_ENABLE_AI_MARKDOWN` | Public | ❌ | `true` | Enable AI markdown views (`/ai/markdown`, with `/_ai/markdown` rewritten) |
| `NEXT_PUBLIC_ENABLE_AI_TRAINING_SIGNAL` | Public | ❌ | `false` | Enable `Content-Signal: ai-train=yes` header |
| `AI_ACTIONS_SECRET` | Server | ⚠️ Production | `""` | Token for AI action endpoints |
| `AI_ACTIONS_RATE_LIMIT_PER_MIN` | Server | ❌ | `30` | Rate limit for AI actions per minute |

**Access via**: `ENV.AI.*`

**⚠️ SECURITY WARNING**: `AI_ACTIONS_SECRET` is server-only. Never prefix with `NEXT_PUBLIC_`.

**Example**:
```bash
NEXT_PUBLIC_ENABLE_AI_MARKDOWN=true
NEXT_PUBLIC_ENABLE_AI_TRAINING_SIGNAL=false
AI_ACTIONS_SECRET=your-long-random-token
AI_ACTIONS_RATE_LIMIT_PER_MIN=30
```

---

### Legal & Compliance

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LEGAL_CONTENT_API_URL` | Server | ❌ | `""` | Centralized legal content API base URL |

**Access via**: `ENV.LEGAL.*`

**Example**:
```bash
LEGAL_CONTENT_API_URL=https://legal.linktrend.systems
```

---

### Database & Caching

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REDIS_URL` | Server | ❌ | `""` | Redis connection URL |
| `DATABASE_URL` | Server | ❌ | `""` | Database connection URL |

**Access via**: `ENV.DATABASE.*`

**⚠️ SECURITY WARNING**: These are server-only variables. Never prefix with `NEXT_PUBLIC_`.

**Redis Format**:
```bash
REDIS_URL=redis://username:password@host:port
```

**Example**:
```bash
REDIS_URL=redis://default:password@redis.acme.com:6379
```

---

## Configuration by Deployment Type

### Master Template

**Purpose**: Base template for all deployments

**Required Variables**: None (uses defaults)

**Recommended Configuration**:
```bash
# Use generic branding
NEXT_PUBLIC_SITE_NAME=Company
NEXT_PUBLIC_SITE_URL=https://example.com

# Use mock CMS for development
NEXT_PUBLIC_CMS_PROVIDER=mock

# Leave analytics empty (clients configure)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GTM_ID=

# Enable all features by default
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_CASE_STUDIES=true
NEXT_PUBLIC_ENABLE_PRICING=true
```

---

### Secondary Templates

**Purpose**: Vertical-specific templates (e.g., SaaS, E-commerce, Agency)

**Inherits**: All Master Template settings

**Customizations**:
- Override `NEXT_PUBLIC_SITE_NAME` for vertical branding
- Customize theme settings
- May disable certain features

**Example (SaaS Template)**:
```bash
# Inherit from Master Template
# Override branding
NEXT_PUBLIC_SITE_NAME=SaaS Platform

# Customize theme
NEXT_PUBLIC_DEFAULT_THEME=accent

# Disable features not needed for SaaS
NEXT_PUBLIC_ENABLE_CASE_STUDIES=false
```

---

### Client Sites

**Purpose**: Production client deployments

**Required Variables**:
- ✅ `NEXT_PUBLIC_SITE_NAME` - Client's brand name
- ✅ `NEXT_PUBLIC_SITE_URL` - Client's domain
- ✅ CMS configuration (if using Payload)
- ⚠️ Governed contact delivery gateway and durable outbox

**Recommended Variables**:
- Analytics configuration
- Social media URLs
- External app URLs

**Example (Client: Acme Corp)**:
```bash
# Site Configuration
NEXT_PUBLIC_SITE_NAME=Acme Corp
NEXT_PUBLIC_SITE_URL=https://acme.com
NEXT_PUBLIC_COMPANY_LEGAL_NAME=Acme Corporation
NEXT_PUBLIC_COMPANY_EMAIL=contact@acme.com
NEXT_PUBLIC_COMPANY_PHONE=+1-555-0123

# CMS Configuration
NEXT_PUBLIC_CMS_PROVIDER=payload
PAYLOAD_PUBLIC_SERVER_URL=https://cms.acme.com
NEXT_PUBLIC_PAYLOAD_API_URL=https://cms.acme.com
PAYLOAD_API_KEY=prod-secret-key-here

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123XYZ
NEXT_PUBLIC_GTM_ID=GTM-ABC123
NEXT_PUBLIC_FB_PIXEL_ID=123456789

# Social Media
NEXT_PUBLIC_TWITTER_HANDLE=@acmecorp
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/acme

# External Apps
NEXT_PUBLIC_APP_LOGIN_URL=https://app.acme.com/login
NEXT_PUBLIC_APP_SIGNUP_URL=https://app.acme.com/signup

# Contact Form / governed delivery
LINKAUTOWORK_GATEWAY_URL=https://gateway.acme.example/events
LINKAUTOWORK_SIGNING_SECRET=<secret-manager-reference>

# Feature Flags (customize as needed)
NEXT_PUBLIC_ENABLE_LIVE_CHAT=true
```

---

## Local Development Setup

### Step 1: Copy Environment Template

```bash
cp .env.example .env.local
```

### Step 2: Configure for Local Development

**Minimal Configuration** (uses defaults):
```bash
# .env.local
NEXT_PUBLIC_SITE_NAME=My Local Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CMS_PROVIDER=mock
```

**Full Development Configuration**:
```bash
# .env.local
NODE_ENV=development

# Site
NEXT_PUBLIC_SITE_NAME=My Local Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_EMAIL=dev@localhost

# CMS (mock mode)
NEXT_PUBLIC_CMS_PROVIDER=mock

# Theme
NEXT_PUBLIC_DEFAULT_THEME=default

# Analytics (leave empty for dev)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GTM_ID=

# Contact Form (governed delivery disabled locally)
LINKAUTOWORK_GATEWAY_URL=

# Feature Flags
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
```

### Step 3: Start Development Server

```bash
npm run dev
# or
pnpm dev
```

### Step 4: Verify Configuration

Check the console for any environment variable warnings or errors.

---

## Staging Environment

**Purpose**: Pre-production testing with real CMS and integrations

**Configuration Strategy**:
- Use staging CMS instance
- Use test analytics properties
- Use staging webhooks
- Enable all features for testing

**Example**:
```bash
# .env.production (staging)
NODE_ENV=production

# Site
NEXT_PUBLIC_SITE_NAME=Acme Corp (Staging)
NEXT_PUBLIC_SITE_URL=https://staging.acme.com

# CMS (staging instance)
NEXT_PUBLIC_CMS_PROVIDER=payload
PAYLOAD_PUBLIC_SERVER_URL=https://cms-staging.acme.com
NEXT_PUBLIC_PAYLOAD_API_URL=https://cms-staging.acme.com
PAYLOAD_API_KEY=staging-api-key

# Analytics (test properties)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-STAGING123
NEXT_PUBLIC_GTM_ID=GTM-STAGING

# Contact Form (staging governed gateway)
LINKAUTOWORK_GATEWAY_URL=https://gateway-staging.acme.example/events
LINKAUTOWORK_SIGNING_SECRET=<secret-manager-reference>

# Feature Flags (all enabled)
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=true
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Deployment**:
```bash
# Build with staging env
npm run build

# Deploy to staging platform
vercel --prod --env-file=.env.production
```

---

## Production Environment

**Purpose**: Live production deployment

**Configuration Strategy**:
- Use production CMS
- Use production analytics
- Use production webhooks
- Configure all required variables
- Use strong secrets

**Example**:
```bash
# .env.production
NODE_ENV=production

# Site (REQUIRED)
NEXT_PUBLIC_SITE_NAME=Acme Corp
NEXT_PUBLIC_SITE_URL=https://acme.com
NEXT_PUBLIC_COMPANY_LEGAL_NAME=Acme Corporation
NEXT_PUBLIC_COMPANY_EMAIL=contact@acme.com

# CMS (REQUIRED)
NEXT_PUBLIC_CMS_PROVIDER=payload
PAYLOAD_PUBLIC_SERVER_URL=https://cms.acme.com
NEXT_PUBLIC_PAYLOAD_API_URL=https://cms.acme.com
PAYLOAD_API_KEY=prod-strong-secret-key

# Analytics (RECOMMENDED)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-PROD123XYZ
NEXT_PUBLIC_GTM_ID=GTM-PROD123
NEXT_PUBLIC_FB_PIXEL_ID=123456789
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=987654

# Social Media (RECOMMENDED)
NEXT_PUBLIC_TWITTER_HANDLE=@acmecorp
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/acme
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/acmecorp

# External Apps (RECOMMENDED)
NEXT_PUBLIC_APP_LOGIN_URL=https://app.acme.com/login
NEXT_PUBLIC_APP_SIGNUP_URL=https://app.acme.com/signup

# Contact Form (governed boundary REQUIRED)
LINKAUTOWORK_GATEWAY_URL=https://gateway.acme.example/events
LINKAUTOWORK_SIGNING_SECRET=<secret-manager-reference>

# Database (if needed)
REDIS_URL=redis://user:password@redis.acme.com:6379

# Feature Flags (customize)
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=true
```

**Deployment Checklist**:
- [ ] All required variables set
- [ ] No example.com or generic values
- [ ] Strong secrets (32+ characters)
- [ ] Different secrets from staging
- [ ] Analytics IDs verified
- [ ] Webhook URLs tested
- [ ] CMS connection verified
- [ ] Build succeeds locally
- [ ] TypeScript check passes

**Deployment**:
```bash
# Verify configuration
npm run build
npm run type-check

# Deploy to production
vercel --prod
```

---

## Security Best Practices

### 1. Secret Management

**✅ DO**:
- Use strong, random secrets (32+ characters)
- Use different secrets for each environment
- Rotate secrets regularly (quarterly)
- Store secrets in secure vaults (1Password, AWS Secrets Manager)
- Use environment-specific secrets

**❌ DON'T**:
- Commit `.env.local` or `.env.production` to git
- Share secrets in Slack, email, or documents
- Use the same secrets across environments
- Use weak or predictable secrets
- Prefix secrets with `NEXT_PUBLIC_`

### 2. Public vs Private Variables

**Public Variables** (`NEXT_PUBLIC_*`):
- Exposed to browser
- Safe for client-side code
- Visible in page source
- Examples: Site name, URLs, analytics IDs

**Private Variables** (no prefix):
- Server-side only
- Never exposed to browser
- Examples: API keys, webhook secrets, database URLs

### 3. Environment File Security

```bash
# .gitignore (already configured)
.env.local
.env.production
.env*.local
```

**File Permissions**:
```bash
chmod 600 .env.local
chmod 600 .env.production
```

### 4. Validation

The system validates required variables at startup:

```typescript
import { validateRequiredEnvVars } from '@/config';

// Call in app initialization
validateRequiredEnvVars();
```

### 5. Secrets Rotation

**Quarterly Rotation Schedule**:
1. Generate new secrets
2. Update in vault
3. Deploy to staging
4. Test thoroughly
5. Deploy to production
6. Revoke old secrets

---

## Troubleshooting

### Build Fails with Missing Environment Variable

**Error**:
```
Error: Required environment variable NEXT_PUBLIC_SITE_URL is not set
```

**Solution**:
1. Check `.env.local` or `.env.production` exists
2. Verify variable is set correctly
3. Restart dev server after changes
4. Check for typos in variable names

### Environment Variables Not Updating

**Problem**: Changes to `.env.local` not reflected

**Solution**:
```bash
# Stop dev server (Ctrl+C)
# Restart dev server
npm run dev
```

**Note**: Next.js caches env vars at startup. Must restart to pick up changes.

### NEXT_PUBLIC_ Variables Not Available in Browser

**Problem**: `ENV.SITE.SITE_NAME` is undefined in client component

**Checklist**:
1. ✅ Variable prefixed with `NEXT_PUBLIC_`?
2. ✅ Dev server restarted after adding variable?
3. ✅ Variable defined in `.env.local`?
4. ✅ No typos in variable name?

### CMS Connection Fails

**Error**: `Failed to fetch from Payload CMS`

**Checklist**:
1. ✅ `NEXT_PUBLIC_CMS_PROVIDER=payload`?
2. ✅ `NEXT_PUBLIC_PAYLOAD_API_URL` correct?
3. ✅ `PAYLOAD_API_KEY` set (if required)?
4. ✅ CMS server running and accessible?
5. ✅ Network/firewall not blocking?

**Debug**:
```bash
# Test CMS connection
curl https://cms.acme.com/api/health
```

### Governed Contact Delivery Fails

**Error**: `governed LiNKautowork contact configuration is incomplete`

**Checklist**:
1. ✅ `LINKAUTOWORK_GATEWAY_URL` correct?
2. ✅ Explicit event/org/environment grant is present?
3. ✅ Signing secret and key id are loaded from the secret manager?
4. ✅ Durable outbox path and separate integrity secret are writable/configured?
5. ✅ Gateway returns a valid acknowledgement receipt?

**Debug**:
```bash
# Exercise the local governed worker; unsigned manual posts are not supported
pnpm --filter @linksites/cms autowork:drain
```

### TypeScript Errors After Adding ENV

**Error**: `Property 'NEW_VAR' does not exist on type...`

**Solution**:
1. Add variable to `config/env.config.ts`
2. Add to appropriate group (SITE_ENV, CMS_ENV, etc.)
3. Export in ENV object
4. Restart TypeScript server in IDE

### Production Build Fails

**Error**: `Validation failed: Missing required environment variables`

**Solution**:
1. Check all required variables are set
2. Verify no example.com values in production
3. Run local build to test:
```bash
NODE_ENV=production npm run build
```

---

## Additional Resources

- [Next.js Environment Variables Docs](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

---

## Support

For questions or issues:
1. Check this documentation
2. Review `.env.example`
3. Check `config/env.config.ts` source code
4. Contact DevOps team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained by**: LinkTrend Development Team
