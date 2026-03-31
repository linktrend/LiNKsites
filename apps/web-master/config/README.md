# Configuration Layer

This directory contains the centralized configuration for the Master Template. All site-wide settings, theme definitions, and CMS configurations are managed here.

## 📁 Structure

```
config/
├── site.config.ts      # Site identity, SEO, analytics, environment variables
├── theme.config.ts     # Theme tokens, variants, and design system
├── cms.config.ts       # CMS provider settings and schema definitions
├── index.ts            # Central export point for all config
└── README.md           # This file
```

## 🎯 Purpose

The configuration layer provides:

1. **Single Source of Truth**: All configuration in one place
2. **Type Safety**: Strongly typed configuration with TypeScript
3. **Environment Support**: Easy environment variable mapping
4. **Override Capability**: Support for template and client overrides
5. **Documentation**: Self-documenting configuration structure

## 📖 Configuration Files

### `site.config.ts`

Contains site-wide configuration including:

- **Site Identity**: Site name, URL, description
- **Languages**: Supported languages and locales
- **Company Info**: Company details, contact information, social media
- **SEO Defaults**: Meta tags, Open Graph, Twitter Card settings
- **Analytics**: Google Analytics, GTM, Facebook Pixel, etc.
- **Feature Flags**: Enable/disable features across the site
- **Environment**: Environment detection and base URLs
- **External URLs**: Login, signup, admin, support URLs

**Example Usage:**

```typescript
import { SITE_CONFIG, getSiteName, APP_URLS } from '@/config';

// Get site name
const siteName = getSiteName();

// Access site URL
const siteUrl = SITE_CONFIG.siteUrl;

// Use app URLs
<a href={APP_URLS.login}>Login</a>
```

### `theme.config.ts`

Contains theme and design system configuration:

- **Theme Tokens**: Colors, typography, spacing, shadows, gradients
- **Theme Variants**: Default, dark, accent, light themes
- **Design System Version**: Track design system versions
- **CSS Variables**: Generate CSS custom properties from theme

**Example Usage:**

```typescript
import { getTheme, THEMES, getThemeCSSVariables } from '@/config';

// Get default theme
const theme = getTheme('default');

// Access theme colors
const primaryColor = theme.tokens.colors.primary;

// Get CSS variables
const cssVars = getThemeCSSVariables(theme);
```

### `cms.config.ts`

Contains CMS integration configuration:

- **CMS Provider**: Payload CMS or mock data settings
- **Collections**: Define all CMS collections
- **Field Types**: Type definitions for CMS fields
- **Section Types**: Available section/component types
- **Schema Helpers**: Reusable field definitions (SEO, status, etc.)
- **Template Config**: Compatible with `template.config.json`

**Example Usage:**

```typescript
import { CMS_PROVIDER, CMS_COLLECTIONS, getCollectionEndpoint } from '@/config';

// Check CMS provider
if (CMS_PROVIDER.type === 'payload') {
  // Use Payload CMS
}

// Get collection endpoint
const endpoint = getCollectionEndpoint('offers');
```

### `index.ts`

Central export point that re-exports everything from all config files. Import from here for convenience:

```typescript
// Import from the main config entry point
import { 
  SITE_CONFIG, 
  getTheme, 
  CMS_COLLECTIONS 
} from '@/config';
```

## 🔄 Override Strategy

The configuration layer supports multiple levels of overrides:

### 1. Environment Variables (Highest Priority)

Set environment variables to override default values:

```bash
# .env.local
NEXT_PUBLIC_SITE_NAME="My Custom Site"
NEXT_PUBLIC_SITE_URL="https://mycustomsite.com"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### 2. CMS Overrides (When Connected)

When CMS is connected, certain values can be overridden:

- Site name and branding
- Company information
- Navigation structure
- Page-specific settings

### 3. Secondary Template Overrides

When creating a secondary template:

1. **Create a new config directory** in your template:
   ```
   templates/my-template/config/
   ```

2. **Override specific config files**:
   ```typescript
   // templates/my-template/config/site.config.ts
   import { SITE_CONFIG as BASE_CONFIG } from '@/config';
   
   export const SITE_CONFIG = {
     ...BASE_CONFIG,
     siteName: 'My Template Site',
     description: 'Custom template description',
   };
   ```

3. **Update imports** in your template to use local config

### 4. Client Site Overrides

When cloning for a client:

1. **Update environment variables** in `.env.local`
2. **Customize config files** as needed
3. **Connect to client's CMS** for dynamic overrides

## 🚀 Usage Examples

### Basic Site Configuration

```typescript
import { SITE_CONFIG, getSiteName, getAbsoluteUrl } from '@/config';

export function Header() {
  const siteName = getSiteName();
  const logoUrl = getAbsoluteUrl('/logo.png');
  
  return (
    <header>
      <img src={logoUrl} alt={siteName} />
      <h1>{siteName}</h1>
    </header>
  );
}
```

### Theme Configuration

```typescript
import { getTheme, getThemeCSSVariables } from '@/config';

export async function Layout() {
  const theme = await getThemeFromRequest();
  const cssVars = getThemeCSSVariables(theme);
  
  return (
    <html style={cssVars}>
      {/* Your content */}
    </html>
  );
}
```

### SEO Configuration

```typescript
import { SEO_CONFIG, SITE_CONFIG } from '@/config';

export function generateMetadata() {
  return {
    title: SITE_CONFIG.siteName,
    description: SITE_CONFIG.description,
    keywords: SEO_CONFIG.defaultKeywords,
    openGraph: {
      images: [SEO_CONFIG.openGraph.images.default],
    },
  };
}
```

### Analytics Configuration

```typescript
import { ANALYTICS_CONFIG } from '@/config';

export function Analytics() {
  if (ANALYTICS_CONFIG.googleAnalytics.enabled) {
    return (
      <script
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalytics.measurementId}`}
      />
    );
  }
  return null;
}
```

## 🔧 Environment Variables

### Required Variables

```bash
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_URL="https://yoursite.com"
```

### Optional Variables

```bash
# Company Information
NEXT_PUBLIC_COMPANY_EMAIL="hello@yoursite.com"
NEXT_PUBLIC_TWITTER_HANDLE="@yoursite"

# External URLs
NEXT_PUBLIC_APP_LOGIN_URL="https://app.yoursite.com/login"
NEXT_PUBLIC_APP_SIGNUP_URL="https://app.yoursite.com/signup"

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
NEXT_PUBLIC_FB_PIXEL_ID="XXXXXXXXXXXXXXX"

# CMS
NEXT_PUBLIC_CMS_PROVIDER="payload"
NEXT_PUBLIC_PAYLOAD_API_URL="http://localhost:3000"

# Feature Flags
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT="true"
NEXT_PUBLIC_ENABLE_LIVE_CHAT="false"
```

## 📝 Best Practices

### 1. Always Import from `@/config`

```typescript
// ✅ Good
import { SITE_CONFIG, getTheme } from '@/config';

// ❌ Bad
import { SITE_CONFIG } from '@/config/site.config';
```

### 2. Use Helper Functions

```typescript
// ✅ Good
const siteName = getSiteName();
const siteUrl = getSiteUrl();

// ❌ Bad
const siteName = SITE_CONFIG.siteName;
const siteUrl = SITE_CONFIG.siteUrl.replace(/\/$/, '');
```

### 3. Type Your Config Usage

```typescript
// ✅ Good
import type { SupportedLanguage, Theme } from '@/config';

function MyComponent(lang: SupportedLanguage, theme: Theme) {
  // ...
}

// ❌ Bad
function MyComponent(lang: string, theme: any) {
  // ...
}
```

### 4. Don't Hardcode Values

```typescript
// ✅ Good
import { APP_URLS } from '@/config';
<a href={APP_URLS.login}>Login</a>

// ❌ Bad
<a href="https://app.example.com/login">Login</a>
```

## 🔍 Migration Guide

If you're migrating from the old configuration structure:

### Old Structure
```
src/lib/siteConfig.ts
src/lib/brand.ts
src/themes/default.ts
```

### New Structure
```
config/site.config.ts
config/theme.config.ts
config/cms.config.ts
config/index.ts
```

### Migration Steps

1. **Update imports**:
   ```typescript
   // Old
   import { siteConfig } from '@/lib/siteConfig';
   import { getSiteName } from '@/lib/brand';
   import { defaultTheme } from '@/themes/default';
   
   // New
   import { SITE_CONFIG, getSiteName, getTheme } from '@/config';
   ```

2. **Update variable names**:
   ```typescript
   // Old
   siteConfig.name
   siteConfig.url
   
   // New
   SITE_CONFIG.siteName
   SITE_CONFIG.siteUrl
   ```

3. **Use new helper functions**:
   ```typescript
   // Old
   const url = siteConfig.url.replace(/\/$/, '');
   
   // New
   const url = getSiteUrl();
   ```

## 🤝 Contributing

When adding new configuration:

1. **Choose the right file**: Site settings go in `site.config.ts`, theme in `theme.config.ts`, CMS in `cms.config.ts`
2. **Add TypeScript types**: Always type your configuration
3. **Provide defaults**: Include sensible default values
4. **Add helper functions**: Create helpers for common operations
5. **Update exports**: Export from `index.ts`
6. **Document**: Add usage examples to this README

## 📚 Related Documentation

- [Template Configuration Guide](../docs/template-config.md)
- [Theme Customization Guide](../docs/theme-customization.md)
- [CMS Integration Guide](../docs/cms-integration.md)
- [Environment Variables Guide](../docs/environment-variables.md)

## 🆘 Support

For questions or issues with configuration:

1. Check this README first
2. Review the inline documentation in config files
3. Check the main project documentation
4. Contact the template maintainers

---

**Last Updated**: December 2024  
**Config Version**: 1.0.0  
**Design System Version**: v1
