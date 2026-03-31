# Theming Quick Reference

**Quick access guide for common theming tasks**

---

## 🎨 Most Used Tokens

### Colors
```css
--color-primary          /* Brand primary color */
--color-accent           /* CTA/accent color */
--color-background       /* Page background */
--color-foreground       /* Primary text */
--color-muted            /* Subtle backgrounds */
--color-card             /* Card backgrounds */
```

### Typography
```css
--font-family            /* Body font */
```

### Border Radius
```css
--radius-sm              /* 6px */
--radius-md              /* 10px */
--radius-lg              /* 14px */
```

### Semantic Colors
```css
--success                /* Success states */
--warning                /* Warning states */
--danger                 /* Error states */
```

---

## 🚀 Quick Start: Client Branding

**1. Create override file** (`src/styles/client-overrides.css`):

```css
:root {
  /* Your brand colors */
  --color-primary: #YOUR_COLOR;
  --color-accent: #YOUR_ACCENT;
  
  /* Your brand font */
  --font-family: "YourFont", system-ui, sans-serif;
}
```

**2. Import in** `src/styles/globals.css`:

```css
@import './tokens.css';
@import './client-overrides.css';  /* Add this line */
```

**3. Update** `.env.local`:

```bash
NEXT_PUBLIC_SITE_NAME=Your Company
NEXT_PUBLIC_SITE_URL=https://yourcompany.com
```

**Done!** Your brand is applied across the entire site.

---

## 🎯 Common Tasks

### Change Primary Color

```css
/* src/styles/client-overrides.css */
:root {
  --color-primary: #ff6b35;
  --color-primary-foreground: #ffffff;
}
```

### Change Font

```css
:root {
  --font-family: "Montserrat", system-ui, sans-serif;
}
```

### Adjust Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### Dark Mode Override

```css
:root[data-theme="dark"] {
  --color-primary: #4285f4;  /* Lighter for dark mode */
}
```

---

## 📦 Using Tokens in Components

### ✅ Correct: Tailwind Classes

```tsx
<button className="bg-primary text-primary-foreground rounded-md">
  Click me
</button>
```

### ✅ Correct: CSS Variables

```tsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Content
</div>
```

### ❌ Incorrect: Hardcoded Values

```tsx
<button className="bg-[#0ea5e9]">  {/* DON'T DO THIS */}
  Click me
</button>
```

---

## 🎨 Tailwind Class Mappings

| Token | Tailwind Class | Example |
|-------|----------------|---------|
| `--color-primary` | `bg-primary` | `<div className="bg-primary">` |
| `--color-muted` | `bg-muted` | `<div className="bg-muted">` |
| `--color-border` | `border-border` | `<div className="border border-border">` |
| `--radius-md` | `rounded-md` | `<div className="rounded-md">` |

---

## 🔧 Troubleshooting

### Overrides not applying?

Check import order in `globals.css`:

```css
@import './tokens.css';           /* 1. Base */
@import './client-overrides.css'; /* 2. Overrides (last) */
```

### Dark mode not working?

Define overrides for both themes:

```css
:root {
  --color-primary: #1a73e8;
}

:root[data-theme="dark"] {
  --color-primary: #4285f4;
}
```

---

## 📚 Full Documentation

- **Complete Guide**: `docs/THEMING_COMPLETE.md`
- **Extension Guide**: `docs/THEME_EXTENSION_GUIDE.md`
- **Theme Config**: `config/theme.config.ts`
- **CSS Tokens**: `src/styles/tokens.css`

---

## 🎯 Examples by Vertical

### Healthcare
```css
:root {
  --color-primary: #0077b6;      /* Medical blue */
  --color-accent: #00b4d8;
  --font-family: "Source Sans Pro", sans-serif;
}
```

### E-commerce
```css
:root {
  --color-primary: #ff6b35;      /* Energetic orange */
  --color-accent: #f7931e;
  --font-family: "Roboto", sans-serif;
}
```

### Financial Services
```css
:root {
  --color-primary: #1e3a8a;      /* Navy blue */
  --color-accent: #3b82f6;
  --font-family: "IBM Plex Sans", sans-serif;
}
```

---

**Need more help?** See `docs/THEMING_COMPLETE.md` for comprehensive documentation.
