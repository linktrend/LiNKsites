# Hydration Error Isolation Steps

## Step 1: Test with Disabled Components ✅ DONE
I've temporarily disabled:
- ✅ Structured data scripts (JSON-LD)
- ✅ AnalyticsInitializer
- ✅ WebVitalsMonitor

**Action**: Refresh the page and check if the hydration error is gone.

---

## Step 2: If Error Still Present - Isolate Homepage Components

If the error persists, we'll systematically disable homepage components:

### Option A: Disable All Sections Except Hero
Edit `src/app/[lang]/page.tsx` and comment out sections:

```typescript
return (
  <div className="flex flex-col min-h-screen">
    <DynamicBgSection>
      <SocialProofCarousel />
      <SignupHero lang={lang} />
    </DynamicBgSection>
    {/* TEMPORARILY DISABLED */}
    {/* <OfferShowcase /> */}
    {/* <CaseStudiesGrid /> */}
    {/* <ArticlesGrid /> */}
    {/* <NewsletterSection /> */}
  </div>
);
```

### Option B: Disable Hero Components One by One
1. Remove `<SocialProofCarousel />`
2. Remove `<SignupHero />`
3. Remove `<DynamicBgSection>` wrapper
4. Remove `<ScrollIndicator />`

---

## Step 3: Check Browser Console

**IMPORTANT**: Open browser DevTools Console (F12) and look for:
1. The error interceptor output: `🔴 HYDRATION MISMATCH DETECTED`
2. The exact error message
3. The component/file mentioned in the error

**What to look for:**
- Component names in the error
- File paths mentioned
- Attribute names that don't match
- Text content differences

---

## Step 4: Check Network Tab

Sometimes hydration errors are caused by:
- Failed API calls
- Different data between server/client
- Race conditions

Check Network tab for any failed requests.

---

## Step 5: Test in Production Build

```bash
pnpm build
pnpm start
```

Sometimes hydration errors only appear in dev mode or only in production.

---

## Step 6: Check Next.js Config

Look for:
- `reactStrictMode: true` (can cause double renders)
- Custom webpack/babel configs
- Environment variable issues

---

## Most Common Remaining Causes:

1. **CSS/Tailwind class differences** - Server generates different classes than client
2. **next-intl locale detection** - Different locale on server vs client
3. **Theme detection** - `data-theme` attribute differs
4. **Component state initialization** - Some component has non-deterministic initial state
5. **Third-party library** - A library modifies DOM before hydration
