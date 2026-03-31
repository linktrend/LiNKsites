# Component Usage Examples

**Version:** 1.0.0  
**Last Updated:** December 5, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Page Composition Patterns](#page-composition-patterns)
3. [Common Component Combinations](#common-component-combinations)
4. [Real-World Examples](#real-world-examples)
5. [Do's and Don'ts](#dos-and-donts)
6. [Responsive Patterns](#responsive-patterns)
7. [Form Patterns](#form-patterns)
8. [CMS Integration Patterns](#cms-integration-patterns)

---

## Overview

This document provides real-world examples of how to compose and use components from the Master Template library. These patterns demonstrate best practices for building pages, combining components, and creating cohesive user experiences.

---

## Page Composition Patterns

### Homepage Pattern

**Components Used:**
- `SignupHero` - Hero section with signup
- `OfferShowcase` - Product/service showcase
- `PlatformFeatures` - Feature highlights
- `ArticlesGrid` - Recent articles
- `CaseStudiesGrid` - Social proof
- `PricingHomepage` - Pricing preview
- `CTASection` - Final conversion

**Example:**

```tsx
// app/[lang]/page.tsx
import { SignupHero } from "@/components/marketing/SignupHero";
import { OfferShowcase } from "@/components/marketing/OfferShowcase";
import { PlatformFeatures } from "@/components/marketing/PlatformFeatures";
import { ArticlesGrid } from "@/components/marketing/ArticlesGrid";
import { CaseStudiesGrid } from "@/components/marketing/CaseStudiesGrid";
import { PricingHomepage } from "@/components/marketing/PricingHomepage";
import { CTASection } from "@/components/marketing/CTASection";

export default async function HomePage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  
  // Fetch CMS data
  const offers = await getOffers(lang);
  const articles = await getArticles(lang, { limit: 3 });
  const cases = await getCaseStudies(lang, { limit: 3 });

  return (
    <div className="flex flex-col gap-16 sm:gap-20 md:gap-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container py-12 sm:py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                Transform Your Business
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                AI-powered automation for modern enterprises
              </p>
            </div>
            <SignupHero lang={lang} />
          </div>
        </div>
      </section>

      {/* Offers Showcase */}
      <section>
        <OfferShowcase lang={lang} offers={offers} />
      </section>

      {/* Platform Features */}
      <section className="bg-muted/30">
        <div className="container py-16 sm:py-20">
          <PlatformFeatures lang={lang} />
        </div>
      </section>

      {/* Recent Articles */}
      <section className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Latest Insights
          </h2>
          <p className="text-lg text-muted-foreground">
            Learn from our experts
          </p>
        </div>
        <ArticlesGrid lang={lang} articles={articles} />
      </section>

      {/* Case Studies */}
      <section className="bg-muted/30">
        <div className="container py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              See how companies transform with our platform
            </p>
          </div>
          <CaseStudiesGrid lang={lang} caseStudies={cases} />
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container">
        <PricingHomepage lang={lang} />
      </section>

      {/* Final CTA */}
      <section className="container pb-16 sm:pb-20">
        <CTASection lang={lang} />
      </section>
    </div>
  );
}
```

---

### Landing Page Pattern

**Components Used:**
- `DynamicBgSection` - Hero with gradient
- `PlatformFeatures` - Benefits
- `SocialProofCarousel` - Testimonials
- `PricingPreview` - Quick pricing
- `CTA` - Conversion button

**Example:**

```tsx
// app/[lang]/landing/[campaign]/page.tsx
import { DynamicBgSection } from "@/components/marketing/DynamicBgSection";
import { PlatformFeatures } from "@/components/marketing/PlatformFeatures";
import { SocialProofCarousel } from "@/components/marketing/SocialProofCarousel";
import { PricingPreview } from "@/components/marketing/PricingPreview";
import { CTA } from "@/components/common/CTA";

export default function LandingPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <DynamicBgSection
        title="Limited Time Offer"
        subtitle="Get 50% off your first year"
        ctaLabel="Claim Offer"
        ctaUrl={`/${lang}/contact?intent=sales`}
      />

      {/* Features */}
      <section className="container py-16 sm:py-20">
        <PlatformFeatures lang={lang} />
      </section>

      {/* Social Proof */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trusted by Industry Leaders
          </h2>
          <SocialProofCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-16 sm:py-20">
        <PricingPreview lang={lang} />
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-16 sm:py-20">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-lg opacity-90">
            Join thousands of satisfied customers
          </p>
          <CTA
            href={`/${lang}/contact`}
            label="Start Free Trial"
            variant="accent"
            size="md"
          />
        </div>
      </section>
    </div>
  );
}
```

---

### Contact Page Pattern

**Components Used:**
- `StaticBgSection` - Hero with background
- `HelpDeflectionSection` - Self-service first
- `IntentGrid` - Intent selection
- `ContactForm` - Main form
- `ContactChannelList` - Alternative channels
- `GoogleMapEmbed` - Location
- `TrustFooter` - Trust indicators

**Example:**

```tsx
// app/[lang]/contact/page.tsx
import { StaticBgSection } from "@/components/marketing/StaticBgSection";
import { HelpDeflectionSection } from "@/components/contact/HelpDeflectionSection";
import { IntentGrid } from "@/components/contact/IntentGrid";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactChannelList } from "@/components/contact/ContactChannelList";
import { GoogleMapEmbed } from "@/components/contact/GoogleMapEmbed";
import { TrustFooter } from "@/components/contact/TrustFooter";

export default function ContactPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <StaticBgSection
        backgroundImage="/images/contact-hero.jpg"
        title="Get in Touch"
        description="We're here to help"
      />

      {/* Help Deflection */}
      <section className="container">
        <HelpDeflectionSection lang={lang} />
      </section>

      {/* Main Content */}
      <section className="container">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Send us a message</h2>
              <p className="text-muted-foreground">
                Choose your inquiry type and we'll get back to you within 24 hours
              </p>
            </div>

            {!selectedIntent ? (
              <IntentGrid
                lang={lang}
                onIntentSelect={setSelectedIntent}
              />
            ) : (
              <ContactForm lang={lang} />
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Other ways to reach us</h3>
              <ContactChannelList lang={lang} />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Visit our office</h3>
              <GoogleMapEmbed location="San Francisco, CA" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <TrustFooter />
        </div>
      </section>
    </div>
  );
}
```

---

### Help Center Pattern

**Components Used:**
- `HelpCentreHero` - Hero with search
- `HelpSearchField` - Search bar
- `HelpCategoryHeader` - Category title
- `HelpArticleList` - Article listing
- `HelpBreadcrumbs` - Navigation

**Example:**

```tsx
// app/[lang]/help/page.tsx
import { HelpCentreHero } from "@/components/help/HelpCentreHero";
import { HelpArticleList } from "@/components/help/HelpArticleList";

export default async function HelpCentrePage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const articles = await getHelpArticles(lang);
  const categories = await getHelpCategories(lang);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <HelpCentreHero lang={lang} />

      {/* Categories */}
      <section className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <HelpArticleList
                articles={category.articles}
                lang={lang}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## Common Component Combinations

### Hero + CTA Pattern

```tsx
<section className="relative">
  <div className="container py-20">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left: Content */}
      <div className="space-y-6">
        <h1 className="text-5xl font-bold">Your Title</h1>
        <p className="text-xl text-muted-foreground">
          Your description
        </p>
        <div className="flex gap-4">
          <Button size="lg">Primary Action</Button>
          <Button size="lg" variant="outline">Secondary</Button>
        </div>
      </div>

      {/* Right: Visual or Form */}
      <SignupHero lang={lang} />
    </div>
  </div>
</section>
```

---

### Features + Social Proof Pattern

```tsx
<>
  {/* Features */}
  <section className="container py-16">
    <PlatformFeatures lang={lang} />
  </section>

  {/* Social Proof */}
  <section className="bg-muted/30 py-16">
    <div className="container">
      <h2 className="text-3xl font-bold text-center mb-12">
        Trusted by Thousands
      </h2>
      <SocialProofCarousel testimonials={testimonials} />
    </div>
  </section>
</>
```

---

### Content Grid + CTA Pattern

```tsx
<section className="container py-16">
  <div className="grid lg:grid-cols-3 gap-8">
    {/* Main Content */}
    <div className="lg:col-span-2">
      <ArticlesGrid lang={lang} articles={articles} />
    </div>

    {/* Sidebar CTA */}
    <div className="lg:col-span-1">
      <div className="sticky top-24">
        <CTASection lang={lang} />
      </div>
    </div>
  </div>
</section>
```

---

## Real-World Examples

### SaaS Homepage

```tsx
export default function SaaSHomePage({ params }: { params: { lang: string } }) {
  const lang = params.lang;

  return (
    <>
      {/* Hero with Signup */}
      <section className="bg-gradient-to-br from-primary/10 to-background">
        <div className="container py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold">
              Automate Your Workflow
            </h1>
            <p className="text-xl text-muted-foreground">
              Save 10 hours per week with AI-powered automation
            </p>
            <SignupHero lang={lang} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <PlatformFeatures lang={lang} />
      </section>

      {/* Pricing */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <PricingHomepage lang={lang} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <SocialProofCarousel testimonials={testimonials} />
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold">Start Your Free Trial</h2>
          <p className="text-xl opacity-90">No credit card required</p>
          <Button size="lg" variant="secondary">
            Get Started Free
          </Button>
        </div>
      </section>
    </>
  );
}
```

---

### Service Business Homepage

```tsx
export default function ServiceHomePage({ params }: { params: { lang: string } }) {
  const lang = params.lang;

  return (
    <>
      {/* Hero */}
      <StaticBgSection
        backgroundImage="/images/service-hero.jpg"
        title="Professional Services You Can Trust"
        description="20+ years of experience serving the community"
      />

      {/* Services (Offers) */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive solutions for all your needs
          </p>
        </div>
        <OfferShowcase lang={lang} offers={services} />
      </section>

      {/* Case Studies */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">
            Recent Projects
          </h2>
          <CaseStudiesGrid lang={lang} caseStudies={projects} />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container py-20">
        <div className="max-w-2xl mx-auto">
          <CTASection lang={lang} />
        </div>
      </section>
    </>
  );
}
```

---

### E-commerce Product Page

```tsx
export default function ProductPage({ params }: { params: { lang: string; slug: string } }) {
  const lang = params.lang;
  const product = await getProduct(params.slug);

  return (
    <div className="container py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: `/${lang}` },
          { label: 'Products', href: `/${lang}/products` },
          { label: product.title, href: `/${lang}/products/${product.slug}` },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-12 mt-8">
        {/* Left: Images */}
        <div>
          <img
            src={product.image}
            alt={product.title}
            className="w-full rounded-lg"
          />
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            <p className="text-2xl font-semibold text-primary">
              ${product.price}
            </p>
          </div>

          <p className="text-lg text-muted-foreground">
            {product.description}
          </p>

          <div className="flex gap-4">
            <Button size="lg" className="flex-1">
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              Save for Later
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Check className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">Free Shipping</p>
              </div>
              <div>
                <Check className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">30-Day Returns</p>
              </div>
              <div>
                <Check className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm">Warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
        <OfferShowcase lang={lang} offers={relatedProducts} />
      </section>
    </div>
  );
}
```

---

## Do's and Don'ts

### ✅ Do's

**1. Use Consistent Spacing**

```tsx
// Good: Consistent gap between sections
<div className="flex flex-col gap-16 sm:gap-20 md:gap-24">
  <section>...</section>
  <section>...</section>
  <section>...</section>
</div>
```

**2. Provide Lang Prop**

```tsx
// Good: Always pass lang prop
<SignupHero lang={lang} />
<CTASection lang={lang} />
```

**3. Use Semantic HTML**

```tsx
// Good: Proper semantic structure
<section>
  <h2>Section Title</h2>
  <p>Description</p>
  <div>Content</div>
</section>
```

**4. Implement Responsive Design**

```tsx
// Good: Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

**5. Handle Loading States**

```tsx
// Good: Show loading UI
{isLoading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-muted rounded" />
    <div className="h-4 bg-muted rounded w-3/4" />
  </div>
) : (
  <Content data={data} />
)}
```

---

### ❌ Don'ts

**1. Don't Hardcode Text**

```tsx
// Bad: Hardcoded text
<h1>Welcome to Our Site</h1>

// Good: Use translations
<h1>{t('home.hero.title')}</h1>
```

**2. Don't Skip Accessibility**

```tsx
// Bad: No alt text
<img src="/image.jpg" />

// Good: Descriptive alt text
<img src="/image.jpg" alt="Product showcase" />
```

**3. Don't Ignore Mobile**

```tsx
// Bad: Desktop-only design
<div className="grid grid-cols-4 gap-8">

// Good: Mobile-first responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
```

**4. Don't Mix Design Systems**

```tsx
// Bad: Mixing Tailwind with inline styles
<div className="p-4" style={{ padding: '20px' }}>

// Good: Use Tailwind consistently
<div className="p-4 sm:p-6 lg:p-8">
```

**5. Don't Forget Error Handling**

```tsx
// Bad: No error handling
const data = await fetchData();

// Good: Handle errors
try {
  const data = await fetchData();
} catch (error) {
  return <ErrorMessage error={error} />;
}
```

---

## Responsive Patterns

### Mobile-First Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {items.map(item => (
    <Card key={item.id}>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

### Responsive Typography

```tsx
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
  Responsive Heading
</h1>

<p className="text-base sm:text-lg md:text-xl text-muted-foreground">
  Responsive body text
</p>
```

### Responsive Layout

```tsx
<div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
  {/* Main Content */}
  <div className="flex-1">
    <MainContent />
  </div>

  {/* Sidebar */}
  <aside className="lg:w-80">
    <Sidebar />
  </aside>
</div>
```

### Responsive Spacing

```tsx
<section className="py-12 sm:py-16 md:py-20 lg:py-24">
  <div className="container px-4 sm:px-6 lg:px-8">
    <Content />
  </div>
</section>
```

---

## Form Patterns

### Basic Form with Validation

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name too short"),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
    await submitForm(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
```

### Multi-Step Form

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = (data: any) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && <Step1Form onNext={handleNext} />}
      {step === 2 && <Step2Form onNext={handleNext} onBack={handleBack} />}
      {step === 3 && <Step3Form onBack={handleBack} data={formData} />}
    </div>
  );
}
```

---

## CMS Integration Patterns

### Fetching CMS Data

```tsx
// Server Component
import { getOffers } from "@/lib/contentClient";

export default async function OffersPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  
  // Fetch from CMS
  const offers = await getOffers(lang, {
    status: 'published',
    sort: 'sort_order',
  });

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Our Offers</h1>
      <OfferShowcase lang={lang} offers={offers} />
    </div>
  );
}
```

### Dynamic Routing with CMS

```tsx
// app/[lang]/offers/[slug]/page.tsx
import { getOffer, getOffers } from "@/lib/contentClient";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const offers = await getOffers('en');
  return offers.map((offer) => ({
    slug: offer.slug,
  }));
}

export default async function OfferPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const offer = await getOffer(params.slug, params.lang);

  if (!offer) {
    notFound();
  }

  return <OfferPageLayout lang={params.lang} page={{ data: { offer } }} />;
}
```

### CMS-Driven Component Rendering

```tsx
// Render components based on CMS configuration
export function DynamicPageRenderer({ sections }: { sections: CMSSection[] }) {
  return (
    <div className="flex flex-col gap-16">
      {sections
        .filter((section) => section.visible !== false)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((section) => {
          switch (section.component_type) {
            case 'hero':
              return <HeroSection key={section.id} {...section.config} />;
            case 'features':
              return <FeaturesSection key={section.id} {...section.config} />;
            case 'pricing':
              return <PricingSection key={section.id} {...section.config} />;
            case 'cta':
              return <CTASection key={section.id} {...section.config} />;
            default:
              return null;
          }
        })}
    </div>
  );
}
```

---

## Additional Resources

- **Component Library**: `docs/COMPONENT_LIBRARY.md`
- **Component Index (JSON)**: `docs/components/index.json`
- **Theme System**: `docs/THEMING_COMPLETE.md`
- **CMS Integration**: `docs/CMS_SCHEMA.md`

---

**Need More Examples?**

Refer to the actual page implementations in `src/app/[lang]/` for production-ready examples.
