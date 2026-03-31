# Performance Quick Reference Guide

Quick reference for maintaining performance in Master Template clones.

---

## 🎯 Core Web Vitals Targets

| Metric | Target | What It Measures |
|--------|--------|------------------|
| **LCP** | < 2.5s | Main content load time |
| **FID** | < 100ms | First user interaction delay |
| **CLS** | < 0.1 | Visual stability (no layout shifts) |
| **FCP** | < 1.8s | First content appears |
| **TTFB** | < 800ms | Server response time |
| **INP** | < 200ms | Interaction responsiveness |

---

## ✅ Quick Checklist

Before deploying new features:

- [ ] All images use `next/image`
- [ ] No unnecessary `"use client"` directives
- [ ] No blocking third-party scripts
- [ ] Bundle size checked (`pnpm build`)
- [ ] Lighthouse score > 90
- [ ] Web Vitals monitoring active

---

## 🖼️ Image Optimization

### ✅ DO

```tsx
import Image from "next/image";

// Standard image
<Image 
  src="/image.jpg" 
  alt="Description"
  width={800}
  height={600}
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Hero image (above fold)
<Image 
  src="/hero.jpg" 
  alt="Hero"
  fill
  priority
  quality={85}
  sizes="100vw"
/>

// Background image
<div className="relative overflow-hidden">
  <Image src={bg} alt="" fill className="object-cover" />
  <div className="absolute inset-0 bg-black/60 z-[1]" />
  <div className="relative z-10">{content}</div>
</div>
```

### ❌ DON'T

```tsx
// Regular img tag
<img src="/image.jpg" />

// Inline background
<div style={{ backgroundImage: `url(${img})` }} />

// Missing dimensions
<Image src="/img.jpg" alt="..." />
```

---

## ⚛️ Client Components

### ✅ DO

```tsx
// Keep pages as server components
export default async function Page() {
  const data = await fetchData();
  return <Content data={data} />;
}

// Use client only for interactivity
"use client";
export function InteractiveWidget() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### ❌ DON'T

```tsx
// Making everything client
"use client";
export default function StaticPage() {
  return <div>Static content</div>;
}

// Heavy client components above fold
"use client";
import HeavyLibrary from 'heavy-library'; // 500KB!
```

---

## 📦 Dependencies

### Check Bundle Size

```bash
pnpm build
# Look at "First Load JS" column
# Target: < 300KB for most pages
```

### Before Adding Dependencies

```bash
# Check package size
npm info package-name size

# Check if it's tree-shakeable
# Prefer packages that support ESM
```

---

## 🔍 Web Vitals Monitoring

### View in Development

```bash
pnpm dev
# Open browser console
# Look for: ✅ [WebVitals] LCP: 1847.50ms (good)
```

### Custom Monitoring

```tsx
import { useWebVitals } from '@/hooks/useWebVitals';

function MyComponent() {
  useWebVitals({
    onMetric: (metric) => {
      if (metric.rating !== 'good') {
        console.warn(`Performance issue: ${metric.name}`, metric);
      }
    },
  });
}
```

---

## 🚀 Build Validation

```bash
# 1. Production build
pnpm build

# 2. Check for warnings
# ⚠️ Look for: "Large bundle detected"

# 3. Start production server
pnpm start

# 4. Run Lighthouse
# Open DevTools → Lighthouse → Generate Report
# Target: Performance > 90
```

---

## 🐛 Common Issues

### High LCP (> 4s)

**Cause:** Large images, slow server  
**Fix:** Use `next/image` with `priority`, optimize server

### High CLS (> 0.25)

**Cause:** Images without dimensions, fonts  
**Fix:** Set width/height, use `font-display: optional`

### High FID/INP (> 300ms)

**Cause:** Heavy JavaScript, long tasks  
**Fix:** Code split, optimize event handlers

---

## 📊 Performance Budget

| Resource | Budget | Current |
|----------|--------|---------|
| Main bundle | < 300KB | ~280KB ✅ |
| Route chunks | < 50KB | ~15KB ✅ |
| Hero images | < 200KB | ~150KB ✅ |
| Total page | < 2MB | ~800KB ✅ |

---

## 🔗 Quick Links

- **Full Guide:** [PERFORMANCE_BASELINE_COMPLETE.md](./PERFORMANCE_BASELINE_COMPLETE.md)
- **Completion Report:** [AGENT_22_PERFORMANCE_COMPLETION_REPORT.md](../AGENT_22_PERFORMANCE_COMPLETION_REPORT.md)
- **Web Vitals Module:** `src/lib/webVitals.ts`
- **React Hook:** `src/hooks/useWebVitals.ts`

---

## 💡 Pro Tips

1. **Always test on real devices** - Simulators don't show real performance
2. **Monitor in production** - Real user data is most valuable
3. **Set up alerts** - Get notified when metrics degrade
4. **Review regularly** - Quarterly performance audits
5. **Profile before optimizing** - Measure first, optimize second

---

**Last Updated:** December 3, 2025  
**Maintained By:** Agent 22
