# Home Page CMS - Quick Reference

Quick reference guide for developers implementing CMS integration on the home page.

---

## 🎯 Component → CMS Mapping

| Component | File | CMS Path | Fields Count |
|-----------|------|----------|--------------|
| DynamicBgSection | `marketing/DynamicBgSection.tsx` | `hero.backgroundImage` | 1 |
| SocialProofCarousel | `marketing/SocialProofCarousel.tsx` | `hero.socialProof[]` | 4 items × 4 fields |
| SignupHero | `marketing/SignupHero.tsx` | `hero.signupForm` | 15 fields |
| ScrollIndicator | `marketing/ScrollIndicator.tsx` | `hero.scrollIndicator` | 2 fields |
| PlatformFeatures | `marketing/PlatformFeatures.tsx` | `platformPricing.features` | 2 + (4 cards × 6 fields) |
| PricingPreview | `marketing/PricingPreview.tsx` | `platformPricing.pricing` | 7 + (3 tiers × 8 fields) |
| CTASection | `marketing/CTASection.tsx` | `ctaSolutions.cta` | 4 + array |
| SolutionsOverview | `marketing/SolutionsOverview.tsx` | `ctaSolutions.solutions` | 2 + (4 cards × 6 fields) |

---

## 📊 Data Structure at a Glance

```typescript
interface HomePageCMS {
  hero: {
    backgroundImage: string;
    socialProof: Array<Testimonial | MediaMention>;
    signupForm: SignupFormContent;
    scrollIndicator: { text: string; targetId: string };
  };
  platformPricing: {
    features: { title: string; subtitle: string; cards: FeatureCard[] };
    pricing: { title: string; subtitle: string; tiers: PricingTier[]; /* ... */ };
  };
  ctaSolutions: {
    cta: { title: string; description: string; buttonText: string; /* ... */ };
    solutions: { title: string; subtitle: string; cards: SolutionCard[] };
  };
}
```

---

## 🔧 Implementation Checklist

### Phase 1: Setup
- [ ] Create CMS content type: `homePage`
- [ ] Define all fields in CMS schema
- [ ] Set up image upload for hero background
- [ ] Configure field validations

### Phase 2: Component Updates
- [ ] Update `DynamicBgSection` to accept `backgroundImage` prop
- [ ] Update `SocialProofCarousel` to accept `socialProof[]` prop
- [ ] Update `SignupHero` to accept `signupForm` object
- [ ] Update `ScrollIndicator` to accept `scrollIndicator` object
- [ ] Update `PlatformFeatures` to accept `features` object
- [ ] Update `PricingPreview` to accept `pricing` object
- [ ] Update `CTASection` to accept `cta` object
- [ ] Update `SolutionsOverview` to accept `solutions` object

### Phase 3: Data Attributes
- [ ] Add `data-cms-section` to main sections
- [ ] Add `data-cms-element` to sub-sections
- [ ] Add `data-cms-collection` to repeatable items
- [ ] Add `data-cms-item` to collection items
- [ ] Add `data-cms-field` to editable fields

### Phase 4: Page Integration
- [ ] Create content fetching service
- [ ] Update `src/app/[lang]/page.tsx` to fetch CMS data
- [ ] Pass CMS data to components as props
- [ ] Implement error handling and fallbacks

### Phase 5: Testing
- [ ] Test all sections render with CMS data
- [ ] Test with missing/empty fields
- [ ] Test responsive layouts
- [ ] Test all interactive elements
- [ ] Verify data attributes are present

---

## 🎨 Icon Reference

### Platform Features Icons
```typescript
import { 
  Zap,           // Lightning/Speed
  TrendingUp,    // Growth/Analytics
  Sparkles,      // AI/Magic
  HeadphonesIcon // Support/Service
} from "lucide-react";
```

### Solutions Icons
```typescript
import { 
  Users,      // Team/People
  Building2,  // Company/Industry
  TrendingUp, // Growth/Scale
  UserCheck   // Role/Permission
} from "lucide-react";
```

---

## 📝 Example: Updating a Component

### Before (Hardcoded)
```tsx
export function PlatformFeatures({ lang }: { lang: string }) {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Performance",
      description: "Stream data from every system...",
      href: "/offers/ai-automation"
    },
    // ... more hardcoded items
  ];

  return (
    <div>
      <h2>Platform built for scale</h2>
      {features.map(feature => (
        <Card key={feature.title}>
          {/* ... */}
        </Card>
      ))}
    </div>
  );
}
```

### After (CMS-Driven)
```tsx
interface PlatformFeaturesProps {
  lang: string;
  data: {
    title: string;
    subtitle: string;
    cards: Array<{
      id: number;
      icon: string;
      title: string;
      description: string;
      linkText: string;
      linkUrl: string;
    }>;
  };
}

export function PlatformFeatures({ lang, data }: PlatformFeaturesProps) {
  const iconMap = { Zap, TrendingUp, Sparkles, HeadphonesIcon };

  return (
    <div data-cms-section="platformPricing.features">
      <h2 data-cms-field="platformPricing.features.title">
        {data.title}
      </h2>
      <p data-cms-field="platformPricing.features.subtitle">
        {data.subtitle}
      </p>
      <div data-cms-collection="platformPricing.features.cards">
        {data.cards.map((card, index) => {
          const Icon = iconMap[card.icon as keyof typeof iconMap];
          return (
            <Card 
              key={card.id} 
              data-cms-item={`platformPricing.features.cards[${index}]`}
            >
              <Icon />
              <h3 data-cms-field={`platformPricing.features.cards[${index}].title`}>
                {card.title}
              </h3>
              <p data-cms-field={`platformPricing.features.cards[${index}].description`}>
                {card.description}
              </p>
              <Link href={`/${lang}${card.linkUrl}`}>
                {card.linkText}
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 🔄 Content Fetching Pattern

### Create Content Service
```typescript
// src/lib/homePageContent.ts
export async function getHomePageContent(lang: string) {
  const response = await fetch(`${CMS_API_URL}/pages/home?lang=${lang}`);
  const data = await response.json();
  return data;
}
```

### Update Page Component
```tsx
// src/app/[lang]/page.tsx
export default async function HomePage({ params }: Props) {
  const { lang } = params;
  const content = await getHomePageContent(lang);

  return (
    <div className="flex flex-col">
      <DynamicBgSection backgroundImage={content.hero.backgroundImage}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid min-h-[400px] sm:min-h-[520px] items-center gap-6 sm:gap-8 lg:grid-cols-3 text-white">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <SocialProofCarousel data={content.hero.socialProof} />
            </div>
            <div className="order-1 lg:order-2">
              <SignupHero lang={lang} data={content.hero.signupForm} />
            </div>
          </div>
          <div className="mt-8 sm:mt-12">
            <ScrollIndicator data={content.hero.scrollIndicator} />
          </div>
        </div>
      </DynamicBgSection>

      <section id="linktrend-platform" className="bg-muted/30 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="container grid gap-8 sm:gap-10 px-4 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PlatformFeatures lang={lang} data={content.platformPricing.features} />
          </div>
          <div className="lg:col-span-1">
            <PricingPreview lang={lang} data={content.platformPricing.pricing} />
          </div>
        </div>
      </section>

      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="container grid gap-8 sm:gap-10 px-4 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <CTASection lang={lang} data={content.ctaSolutions.cta} />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <SolutionsOverview lang={lang} data={content.ctaSolutions.solutions} />
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 🎯 Key CMS Paths (Copy-Paste Ready)

### Hero Section
```
hero.backgroundImage
hero.socialProof[].type
hero.socialProof[].quote
hero.socialProof[].author
hero.socialProof[].title
hero.socialProof[].publication
hero.signupForm.title
hero.signupForm.subtitle
hero.signupForm.oauthProviders[]
hero.signupForm.emailLabel
hero.signupForm.phoneLabel
hero.signupForm.submitButtonText
hero.scrollIndicator.text
```

### Platform & Pricing Section
```
platformPricing.features.title
platformPricing.features.subtitle
platformPricing.features.cards[].icon
platformPricing.features.cards[].title
platformPricing.features.cards[].description
platformPricing.features.cards[].linkText
platformPricing.features.cards[].linkUrl
platformPricing.pricing.title
platformPricing.pricing.subtitle
platformPricing.pricing.tiers[].name
platformPricing.pricing.tiers[].monthlyPrice
platformPricing.pricing.tiers[].yearlyPrice
platformPricing.pricing.tiers[].features[]
```

### CTA & Solutions Section
```
ctaSolutions.cta.title
ctaSolutions.cta.description
ctaSolutions.cta.buttonText
ctaSolutions.cta.buttonUrl
ctaSolutions.cta.trustIndicators[]
ctaSolutions.solutions.title
ctaSolutions.solutions.subtitle
ctaSolutions.solutions.cards[].icon
ctaSolutions.solutions.cards[].title
ctaSolutions.solutions.cards[].description
ctaSolutions.solutions.cards[].linkText
ctaSolutions.solutions.cards[].linkUrl
```

---

## 🐛 Common Issues & Solutions

### Issue: Icons not rendering
**Solution:** Ensure icon names in CMS match exactly (case-sensitive)
```typescript
const iconMap = {
  Zap,
  TrendingUp,
  Sparkles,
  HeadphonesIcon,
  Users,
  Building2,
  UserCheck
};

const Icon = iconMap[iconName as keyof typeof iconMap] || Zap; // Fallback
```

### Issue: Carousel not auto-rotating
**Solution:** Ensure carousel logic is preserved in component
```typescript
useEffect(() => {
  const id = setInterval(() => setIndex((prev) => (prev + 1) % items.length), 5000);
  return () => clearInterval(id);
}, [items.length]); // Add dependency
```

### Issue: Pricing toggle not working
**Solution:** Keep state management in component, only data from CMS
```typescript
const [billing, setBilling] = useState<"monthly" | "yearly">(data.defaultBilling);
// Use billing state to display prices
const price = tier[billing]; // tier.monthly or tier.yearly
```

### Issue: Missing data-cms attributes
**Solution:** Add to all editable elements
```tsx
<h2 data-cms-field="section.title">{title}</h2>
<div data-cms-collection="section.items">
  {items.map((item, i) => (
    <div key={item.id} data-cms-item={`section.items[${i}]`}>
      <span data-cms-field={`section.items[${i}].name`}>{item.name}</span>
    </div>
  ))}
</div>
```

---

## 📱 Responsive Considerations

### Mobile (<640px)
- Single column layout
- Signup form appears above carousel
- Cards stack vertically
- Touch targets minimum 44px

### Tablet (640-1024px)
- 2-column grids for cards
- Side-by-side hero layout
- Reduced spacing

### Desktop (>1024px)
- 3-column hero layout
- 2x2 card grids
- Full spacing

---

## ⚡ Performance Tips

1. **Image Optimization**
   - Use Next.js Image component for hero background
   - Serve WebP with JPG fallback
   - Lazy load below-the-fold images

2. **Data Fetching**
   - Cache CMS responses
   - Use ISR (Incremental Static Regeneration)
   - Implement stale-while-revalidate

3. **Component Optimization**
   - Memoize heavy computations
   - Use React.memo for pure components
   - Lazy load off-screen sections

---

## 🔗 Related Files

### Components to Update
- `src/components/marketing/DynamicBgSection.tsx`
- `src/components/marketing/SocialProofCarousel.tsx`
- `src/components/marketing/SignupHero.tsx`
- `src/components/marketing/ScrollIndicator.tsx`
- `src/components/marketing/PlatformFeatures.tsx`
- `src/components/marketing/PricingPreview.tsx`
- `src/components/marketing/CTASection.tsx`
- `src/components/marketing/SolutionsOverview.tsx`

### Page to Update
- `src/app/[lang]/page.tsx`

### New Files to Create
- `src/lib/homePageContent.ts` (content fetching service)
- `src/types/homePage.ts` (TypeScript interfaces)

---

## 📚 Full Documentation

For complete details, see:
- **Full CMS Mapping:** `home-page-cms-mapping.md`
- **Visual Structure:** `home-page-structure-visual.md`
- **Contact Page Example:** `contact-cms-mapping.md`

---

## 🚀 Quick Start

1. **Read** the full CMS mapping document
2. **Create** CMS schema based on data structure
3. **Update** components to accept data props
4. **Add** data-cms attributes
5. **Create** content fetching service
6. **Update** page to use CMS data
7. **Test** thoroughly
8. **Deploy** and monitor

---

## 💡 Pro Tips

- Start with one section at a time (e.g., Hero)
- Keep existing functionality while adding CMS
- Use TypeScript for type safety
- Add fallback content for missing CMS data
- Test with various content lengths
- Document any custom field requirements
- Provide example content for CMS editors

---

## ✅ Definition of Done

- [ ] All components accept CMS data as props
- [ ] All editable elements have data-cms attributes
- [ ] Content fetching service implemented
- [ ] Page component updated to use CMS data
- [ ] TypeScript interfaces defined
- [ ] Error handling and fallbacks in place
- [ ] Responsive design maintained
- [ ] All interactive features working
- [ ] Performance metrics acceptable
- [ ] Documentation updated
- [ ] CMS editors trained
- [ ] QA testing completed

---

**Last Updated:** November 2025  
**Version:** 1.0  
**Maintainer:** Development Team






