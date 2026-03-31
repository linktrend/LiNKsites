# Company-Site Master Template

A production-ready, AI-first, multi-language, CMS-driven corporate/marketing site starter for the LiNKsites Factory Kit. Built with modern web technologies and designed for rapid deployment.

## Features

- **Modern Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS + shadcn/ui
- **Multi-Language Support**: Built-in internationalization with roots for `/en`, `/es`, `/zh-tw`, `/zh-cn`
- **SEO Optimized**: Automatic hreflang tags, canonical URLs, and meta tag management
- **CMS Integration**: Payload CMS integration with structured content management
- **Theme System**: Dynamic theming via CSS variables with `data-theme` attribute
- **Static Generation**: Pre-rendered pages with Incremental Static Regeneration (ISR)
- **Page Templates**: Pre-built templates for offers, resources, about, contact, and legal pages

## Quick Start

### Prerequisites

- Node.js 18+ (see `.nvmrc` for exact version)
- pnpm (recommended) or npm

### Installation

1. **Clone this template** into your project directory:
   ```bash
   cp -r /path/to/master-template /path/to/projects/<your-site-name>
   cd /path/to/projects/<your-site-name>
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and set:
   - `PAYLOAD_BASE_URL`: Your Payload CMS base URL (example: `http://localhost:3000`)
   - `PAYLOAD_API_KEY`: Optional (use only if you want private/authenticated reads)
   - `SITE_ID`: Only for dedicated/premium deployments (locks this frontend to one `siteId`)
   - `DEFAULT_SITE_ID`: Optional local fallback `siteId` (shared-platform mode normally resolves by hostname)
   - Theme defaults and other configuration
   - **Analytics Configuration** (optional, see Analytics section below):
     - `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 Measurement ID
     - `NEXT_PUBLIC_FB_PIXEL_ID`: Facebook Pixel ID
     - `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`: LinkedIn Insight Tag Partner ID
     - `NEXT_PUBLIC_HOTJAR_ID`: Hotjar Site ID

4. **Configure your site**:
   - Edit `template.config.json` to set your site-specific configuration
   - Wire CMS endpoints and payload mappings as needed

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see your site.

Security note:
- Do not commit `.env.local` (it can contain secrets).

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   └── lib/             # Utility functions and configurations
├── public/              # Static assets (images, icons, etc.)
├── messages/            # i18n translation files
├── docs/                # Documentation
│   ├── archived/        # Historical documentation
│   └── assets-unused/   # Archived assets
├── data/                # CMS payload and data files
└── template.config.json # Site configuration
```

## Documentation

### 📚 Documentation Index

**Start here:** [`docs/MASTER_TEMPLATE_INDEX.md`](docs/MASTER_TEMPLATE_INDEX.md) - Complete documentation index organized by audience

### Quick Links

**For Developers:**
- **[Component Library](docs/COMPONENT_LIBRARY.md)** - 77 production-ready components
- **[Component Examples](docs/COMPONENT_EXAMPLES.md)** - Real-world usage patterns
- **[Theming Guide](docs/THEMING_QUICK_REFERENCE.md)** - Customize colors, fonts, and styles
- **[CMS Schema](docs/CMS_SCHEMA.md)** - Content structure and mapping

**For AI Agents:**
- **[AI Context](AI_CONTEXT.md)** - Quick reference for AI agents
- **[Component Registry (JSON)](docs/components/index.json)** - Machine-readable component metadata
- **[AI Theming Guide](docs/AI_THEMING_GUIDE.md)** - Theme creation with prompt templates
- **[Theme Config (JSON)](config/theme.json)** - AI-editable theme configuration

**For Factory Operators:**
- **[Factory Cloning Quick Start](docs/FACTORY_CLONING_QUICK_START.md)** - Clone and deploy in 30 minutes
- **[Factory Cloning Playbook](docs/FACTORY_CLONING_PLAYBOOK.md)** - Detailed procedures
- **[Factory Cloning Checklist](docs/FACTORY_CLONING_CHECKLIST.md)** - Validation checklist
- **[Repository Operator SOP](docs/REPO_OPERATOR_SOP.md)** - Day-to-day GitHub and repo handling guide

### Key Documentation

- **CMS Integration**: [`docs/CMS_SCHEMA.md`](docs/CMS_SCHEMA.md) - Complete CMS structure
- **Migration Guide**: [`docs/MIGRATION_GUIDE.md`](docs/MIGRATION_GUIDE.md) - Upgrading guide
- **Analytics**: [`docs/ANALYTICS_INTEGRATION_COMPLETE.md`](docs/ANALYTICS_INTEGRATION_COMPLETE.md) - Analytics setup
- **SEO**: [`docs/SEO_IMPLEMENTATION_COMPLETE.md`](docs/SEO_IMPLEMENTATION_COMPLETE.md) - SEO optimization
- **Performance**: [`docs/PERFORMANCE_BASELINE_COMPLETE.md`](docs/PERFORMANCE_BASELINE_COMPLETE.md) - Performance guide
- **Forms**: [`docs/FORMS_AND_VALIDATION_COMPLETE.md`](docs/FORMS_AND_VALIDATION_COMPLETE.md) - Form handling

## Architecture

This template is part of the LiNKsites Factory Kit system. For detailed architecture information:

- Architecture specs: `../../sites_specs/Linktrend FULL WEBSITE ARCHITECTURE DESCRIPTION.txt`
- Factory system: `../../sites_specs/LiNKsites Factory Kit - Full System Specification.txt`

## Analytics Integration

This template includes a **privacy-compliant analytics system** with consent gating. Analytics scripts only load after explicit user consent.

### Supported Analytics Providers

- **Google Analytics 4 (GA4)** - Web analytics and reporting
- **Facebook Pixel** - Marketing and conversion tracking
- **LinkedIn Insight Tag** - B2B marketing analytics
- **Hotjar** - Heatmaps and session recording
- **Custom Analytics** - Support for custom endpoints

### Setup Instructions

1. **Get Your Tracking IDs**:
   - **GA4**: Visit [Google Analytics](https://analytics.google.com/) → Admin → Data Streams → Get Measurement ID (format: `G-XXXXXXXXXX`)
   - **Facebook Pixel**: Visit [Facebook Business](https://business.facebook.com/) → Events Manager → Get Pixel ID
   - **LinkedIn**: Visit [LinkedIn Campaign Manager](https://www.linkedin.com/campaignmanager/) → Account Assets → Insight Tag → Get Partner ID
   - **Hotjar**: Visit [Hotjar](https://insights.hotjar.com/) → Sites & Organizations → Get Site ID

2. **Configure Environment Variables**:
   
   Add your tracking IDs to `.env.local`:
   ```bash
   # Google Analytics 4
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Facebook Pixel (optional)
   NEXT_PUBLIC_FB_PIXEL_ID=123456789
   
   # LinkedIn Insight Tag (optional)
   NEXT_PUBLIC_LINKEDIN_PARTNER_ID=123456
   
   # Hotjar (optional)
   NEXT_PUBLIC_HOTJAR_ID=123456
   ```

3. **How It Works**:
   - Analytics scripts **never load** until the user explicitly consents
   - Users can accept all cookies or manage preferences individually
   - Consent preferences are stored in `localStorage`
   - Users can change their preferences at any time via the "Manage Cookies" link in the footer
   - When consent is revoked, all analytics scripts are immediately removed

4. **Testing Analytics**:
   ```bash
   # Build and run production mode
   pnpm build
   pnpm start
   ```
   
   Then:
   - Visit your site and accept cookies
   - Open browser DevTools → Network tab
   - Verify analytics scripts load (look for `googletagmanager.com`, `fbevents.js`, etc.)
   - Check browser console for `[Analytics]` log messages

5. **Adding Custom Analytics Providers**:
   
   The system is designed to be extensible. To add a new provider:
   
   a. Add configuration to `config/site.config.ts`:
   ```typescript
   export const ANALYTICS_CONFIG = {
     // ... existing providers
     myCustomProvider: {
       enabled: !!process.env.NEXT_PUBLIC_MY_PROVIDER_ID,
       providerId: process.env.NEXT_PUBLIC_MY_PROVIDER_ID || '',
     },
   };
   ```
   
   b. Add loader function to `src/lib/analytics.ts`:
   ```typescript
   export function loadMyCustomProvider(): void {
     if (typeof window === 'undefined') return;
     if (loadedProviders.has('myProvider')) return;
     if (!ANALYTICS_CONFIG.myCustomProvider.enabled) return;
     if (!hasAnalyticsConsent()) return; // or hasMarketingConsent()
     
     // Your provider initialization code here
     // ...
     
     loadedProviders.add('myProvider');
   }
   ```
   
   c. Call it from `initializeAnalytics()`:
   ```typescript
   export function initializeAnalytics(): void {
     // ... existing code
     if (preferences.analytics) {
       loadMyCustomProvider();
     }
   }
   ```

### Privacy & GDPR Compliance

- ✅ **No scripts load before consent** - Full GDPR/CCPA compliance
- ✅ **Granular consent control** - Users can enable/disable analytics vs marketing
- ✅ **IP anonymization** - GA4 configured with `anonymize_ip: true`
- ✅ **Consent revocation** - Users can withdraw consent and scripts are immediately removed
- ✅ **Transparent** - Clear cookie policy and preferences UI

### Analytics API Reference

```typescript
import {
  initializeAnalytics,
  trackEvent,
  trackPageView,
  trackFacebookEvent,
  hasAnalyticsConsent,
  hasMarketingConsent,
} from '@/lib/analytics';

// Track custom events
trackEvent({
  action: 'button_click',
  category: 'engagement',
  label: 'signup_button',
  value: 1,
});

// Track page views (automatic in Next.js, but can be called manually)
trackPageView('/custom-page', 'Custom Page Title');

// Track Facebook Pixel events
trackFacebookEvent('Purchase', { value: 99.99, currency: 'USD' });

// Check consent status
if (hasAnalyticsConsent()) {
  // Analytics is enabled
}
```

## Customization

### Component Library

The template includes **77 production-ready components** organized into 11 categories:

- **Marketing** (13) - Hero sections, showcases, CTAs
- **Common** (11) - Shared utilities, breadcrumbs, modals
- **Contact** (11) - Forms, channels, maps
- **Help Center** (9) - Articles, search, feedback
- **Navigation** (2) - Header, footer
- **Pricing** (2) - Pricing pages, toggles
- **Resources** (5) - Articles, case studies, videos
- **UI** (9) - Base components (buttons, inputs, cards)
- **Layouts** (11) - Page layouts
- And more...

**See:** [`docs/COMPONENT_LIBRARY.md`](docs/COMPONENT_LIBRARY.md) for complete documentation

### Theming

The template includes a comprehensive theming system with:

- **CSS Variables** - Design tokens in `src/styles/tokens.css`
- **10 Industry Presets** - SaaS, Healthcare, Finance, E-commerce, Legal, Real Estate, Education, Restaurant, Agency, Non-Profit
- **AI-Editable Config** - `config/theme.json` for rapid theme creation
- **Motion Tokens** - Animation and transition settings
- **Dark Mode** - Built-in dark theme support

**Quick Start:**
1. Choose an industry preset from `config/theme.json`
2. Update `src/styles/tokens.css` with your brand colors
3. Rebuild: `pnpm build`

**See:** [`docs/THEMING_QUICK_REFERENCE.md`](docs/THEMING_QUICK_REFERENCE.md) for detailed guide

### Content Management

Content is split into two types:
- **Structural**: Managed via `cmsStructureClient`
- **Content Items**: Managed via `contentClient` from `ContentItems`

### Adding Pages

1. Create a new route in `src/app/[locale]/your-page/`
2. Add translations in `messages/[locale]/pages.json`
3. Configure CMS mappings if needed

## Support

For issues, questions, or contributions, please refer to the main LiNKsites Factory Kit documentation.

## License

Proprietary - LiNKsites Factory Kit
