# i18n Quick Reference Guide

## For Developers

### Using Translations in Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations(); // Access root level keys
  const tNav = useTranslations('navigation'); // Access navigation namespace
  
  return (
    <div>
      <h1>{t('brandName')}</h1>
      <button>{t('buttons.login')}</button>
      <a href="/about">{tNav('about')}</a>
    </div>
  );
}
```

### Available Namespaces

- **Root level** - `useTranslations()` - Access common.json keys directly
- **navigation** - `useTranslations('navigation')` - Navigation menu items
- **footer** - `useTranslations('footer')` - Footer content
- **pages** - `useTranslations('pages')` - Page-specific content

### Common Translation Keys

```tsx
// Buttons
t('buttons.login')          // "Log In"
t('buttons.signup')         // "Start Free"
t('buttons.createAccount')  // "Create Account"
t('buttons.learnMore')      // "Learn More"
t('buttons.getStarted')     // "Get Started"

// Labels
t('labels.email')           // "Email"
t('labels.phone')           // "Phone"
t('labels.name')            // "Name"

// Placeholders
t('placeholders.email')     // "you@example.com"
t('placeholders.phone')     // "+1 (555) 000-0000"

// Legal
t('legal.privacyPolicy')    // "Privacy Policy"
t('legal.termsOfUse')       // "Terms of Use"
t('legal.acceptTerms')      // "By continuing, you accept our:"

// Navigation
tNav('offers')              // "Offers"
tNav('pricing')             // "Pricing"
tNav('about')               // "About"
tNav('contact')             // "Contact"
```

### Adding New Translations

1. **Add to all language files** in the same structure:

```json
// messages/en/common.json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}

// messages/es/common.json
{
  "newSection": {
    "title": "Nuevo Título",
    "description": "Nueva Descripción"
  }
}
```

2. **Use in component:**

```tsx
const t = useTranslations();

<h2>{t('newSection.title')}</h2>
<p>{t('newSection.description')}</p>
```

### Language-Specific Links

Always include the language parameter in links:

```tsx
// ✅ Correct
<Link href={`/${lang}/about`}>About</Link>

// ❌ Wrong
<Link href="/about">About</Link>
```

### Accessing Current Language

```tsx
// In client components
import { useParams } from 'next/navigation';

export function MyComponent() {
  const params = useParams();
  const lang = params.lang as string;
  
  return <Link href={`/${lang}/contact`}>Contact</Link>;
}

// In server components (pages)
export default function Page({ params }: { params: { lang: string } }) {
  const { lang } = params;
  return <MyComponent lang={lang} />;
}
```

## For Content Editors

### Translation File Structure

```
messages/
├── en/          # English
├── es/          # Spanish
├── zh-tw/       # Traditional Chinese
└── zh-cn/       # Simplified Chinese
```

### Editing Translations

1. Open the appropriate language folder
2. Edit the JSON file for the section you want to change
3. Keep the same key structure across all languages
4. Save and rebuild the application

### Translation Guidelines

- **Keep keys consistent** across all languages
- **Use descriptive keys** like `buttons.login` not `btn1`
- **Maintain formatting** like line breaks and HTML tags
- **Test all languages** after making changes
- **Use placeholders** for dynamic content: `{variable}`

### Example Translation Update

To change the signup button text:

```json
// messages/en/common.json
{
  "buttons": {
    "signup": "Start Free Trial"  // Changed from "Start Free"
  }
}

// messages/es/common.json
{
  "buttons": {
    "signup": "Iniciar Prueba Gratuita"  // Update Spanish too
  }
}
```

## Supported Languages

| Code | Language | Example URL |
|------|----------|-------------|
| `en` | English | `/en/pricing` |
| `es` | Spanish | `/es/pricing` |
| `zh-tw` | Traditional Chinese | `/zh-tw/pricing` |
| `zh-cn` | Simplified Chinese | `/zh-cn/pricing` |

## Common Issues & Solutions

### Issue: Translation key not found
**Solution:** Check that the key exists in all language files with the same path

### Issue: Wrong language showing
**Solution:** Verify the URL includes the correct language prefix (e.g., `/en/`, `/es/`)

### Issue: Build fails after adding translations
**Solution:** Ensure all JSON files have valid syntax (no trailing commas, proper quotes)

### Issue: Component shows translation key instead of text
**Solution:** Make sure you're using `useTranslations()` hook and accessing the correct namespace

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Keep translations organized** - Use logical grouping in JSON files
3. **Test all languages** - Verify changes work across all supported languages
4. **Use TypeScript** - Get autocomplete and type safety for translation keys
5. **Document new keys** - Add comments in JSON for complex translations
6. **Consistent naming** - Follow existing naming patterns for new keys

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Translation Files](/messages/)
- [i18n Configuration](/src/i18n.ts)
- [Middleware Configuration](/src/middleware.ts)
