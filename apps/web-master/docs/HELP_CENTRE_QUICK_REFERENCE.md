# Help Centre Quick Reference

**Quick access guide for developers working with the Help Centre system**

---

## URLs

```
/resources/faq                                    → Landing page
/resources/faq/getting-started                    → Category page
/resources/faq/getting-started/create-account     → Article page
```

---

## Key Files

### Pages
```
src/app/[lang]/resources/faq/page.tsx                              → Landing
src/app/[lang]/resources/faq/[categorySlug]/page.tsx               → Category
src/app/[lang]/resources/faq/[categorySlug]/[articleSlug]/page.tsx → Article
```

### Components
```
src/components/resources/HelpCentrePageContent.tsx  → Landing content
src/components/help/HelpCentreHero.tsx              → Hero section
src/components/help/HelpSearchField.tsx             → Search input
src/components/help/HelpBreadcrumbs.tsx             → Breadcrumbs
src/components/help/HelpCategoryHeader.tsx          → Category header
src/components/help/HelpArticleHeader.tsx           → Article header
src/components/help/HelpArticleBody.tsx             → Article body
src/components/help/HelpArticleList.tsx             → Article list
src/components/help/HelpArticleRelated.tsx          → Related articles
src/components/help/HelpArticleFeedback.tsx         → Feedback widget
```

### Data & Config
```
src/lib/helpMockData.ts       → Mock data (Phase 1)
src/lib/cms/schema.ts         → CMS schema (FaqSchema)
src/lib/routes.ts             → Route helpers
messages/[lang]/common.json   → i18n translations
```

---

## Default Categories

1. **getting-started** - Getting Started / Onboarding (BookOpen icon)
2. **core-features** - Using the Product / Core Features (Zap icon)
3. **billing** - Account & Billing Management (CreditCard icon)
4. **troubleshooting** - Troubleshooting (Wrench icon)
5. **faqs** - FAQs (HelpCircle icon)
6. **integrations** - Integrations & API Documentation (Code icon)

---

## CMS Schema

```typescript
// From src/lib/cms/schema.ts
export const FaqSchema = z.object({
  question: z.string().min(1),           // Article title
  answer: z.string().min(1),             // Article body (rich text)
  category: FaqCategorySchema.optional(), // Category enum
  offerSlug: z.string().optional(),      // Related offer
  sort_order: z.number().default(0),     // Display order
  tags: z.array(z.string()).default([]), // Search tags
  helpful_count: z.number().default(0),  // Feedback count
  status: StatusSchema.default('published'),
});

export const FaqCategorySchema = z.enum([
  'getting-started',
  'billing',
  'technical',
  'account',
  'features',
  'integration',
  'security',
  'general',
]);
```

---

## i18n Keys

```json
{
  "help": {
    "feedback": {
      "question": "Did this answer your question?",
      "yes": "Yes",
      "no": "No",
      "thanks": "Thanks for your feedback!"
    },
    "search": {
      "heading": "How can we help you?",
      "description": "Find answers and guidance for all your questions",
      "label": "Search help articles"
    },
    "noArticles": "No articles found in this category.",
    "checkBackSoon": "Check back soon for new content or",
    "contactSupport": "contact support",
    "forAssistance": "for assistance.",
    "relatedArticles": "Related Articles"
  },
  "breadcrumbs": {
    "helpCentre": "Help Centre"
  }
}
```

---

## Route Helpers

```typescript
import { routes } from '@/lib/routes';

routes.helpCentre(lang)                           // /en/resources/faq
routes.helpCategory(lang, categorySlug)           // /en/resources/faq/getting-started
routes.helpArticle(lang, categorySlug, articleSlug) // /en/resources/faq/getting-started/create-account
```

---

## Mock Data Functions

```typescript
import { 
  getCategoryBySlug, 
  getArticlesByCategory, 
  getArticleBySlug,
  getRelatedArticles 
} from '@/lib/helpMockData';

// Get category
const category = getCategoryBySlug('getting-started');

// Get articles in category
const articles = getArticlesByCategory('getting-started');

// Get specific article
const article = getArticleBySlug('getting-started', 'create-account');

// Get related articles
const related = getRelatedArticles(['1', '2', '3']);
```

---

## Common Customizations

### Add New Category

1. Update schema:
```typescript
// src/lib/cms/schema.ts
export const FaqCategorySchema = z.enum([
  'getting-started',
  'billing',
  // ... existing
  'your-new-category', // Add here
]);
```

2. Add to mock data:
```typescript
// src/lib/helpMockData.ts
export const helpCategories: HelpCategory[] = [
  // ... existing
  {
    id: "7",
    slug: "your-new-category",
    title: "Your Category Title",
    slogan: "Category description",
    description: "Full description",
    author: "Support Team",
    articleCount: 0,
    lastUpdated: "2025-12-03",
    icon: "YourIcon",
  },
];
```

3. Add icon mapping:
```typescript
// src/components/resources/HelpCentrePageContent.tsx
import { YourIcon } from "lucide-react";

const getIcon = (iconName: string) => {
  const icons = {
    // ... existing
    YourIcon,
  };
  return icons[iconName as keyof typeof icons] || HelpCircle;
};
```

### Add New Article

```typescript
// src/lib/helpMockData.ts
export const helpArticles: HelpArticle[] = [
  // ... existing
  {
    id: "26",
    slug: "your-article-slug",
    categorySlug: "getting-started",
    title: "Your Article Title",
    shortDescription: "Brief description for cards",
    author: "Author Name",
    updatedAt: "2025-12-03",
    body: `
      <h2>Section Title</h2>
      <p>Your content here...</p>
    `,
    relatedArticles: ["1", "2"],
  },
];
```

### Customize Search

```typescript
// src/components/help/HelpSearchField.tsx
const onSubmit = (data: SearchFormData) => {
  console.log("Search query:", data.query);
  
  // Option 1: Client-side filtering
  const results = articles.filter(article => 
    article.title.toLowerCase().includes(data.query.toLowerCase())
  );
  
  // Option 2: API call
  fetch(`/api/help/search?q=${data.query}`)
    .then(res => res.json())
    .then(results => setSearchResults(results));
  
  // Option 3: Algolia
  searchClient.search(data.query).then(results => {
    setSearchResults(results.hits);
  });
};
```

### Track Feedback

```typescript
// src/components/help/HelpArticleFeedback.tsx
const handleFeedback = (response: 'yes' | 'no') => {
  setFeedback(response);
  
  // Option 1: PostHog
  posthog.capture('help_article_feedback', {
    articleSlug,
    feedback: response,
  });
  
  // Option 2: Google Analytics
  gtag('event', 'help_feedback', {
    article_slug: articleSlug,
    feedback: response,
  });
  
  // Option 3: Backend API
  fetch('/api/help/feedback', {
    method: 'POST',
    body: JSON.stringify({ articleSlug, feedback: response }),
  });
};
```

---

## CMS Migration Checklist

### Phase 1: Preparation
- [ ] Review current mock data structure
- [ ] Identify custom categories/content
- [ ] Plan content migration strategy

### Phase 2: CMS Setup
- [ ] Create FAQ collection in Payload CMS
- [ ] Configure fields to match FaqSchema
- [ ] Set up relationships (offerSlug)
- [ ] Import initial content

### Phase 3: Code Updates
- [ ] Replace `helpMockData` imports with CMS queries
- [ ] Update `getCategoryBySlug()` to fetch from CMS
- [ ] Update `getArticlesByCategory()` to fetch from CMS
- [ ] Update `getArticleBySlug()` to fetch from CMS
- [ ] Test all pages with CMS data

### Phase 4: Sitemap
- [ ] Add dynamic FAQ routes to sitemap.ts
- [ ] Generate category pages dynamically
- [ ] Generate article pages dynamically
- [ ] Test sitemap.xml output

### Phase 5: Validation
- [ ] Test all Help Centre pages
- [ ] Verify SEO metadata
- [ ] Check i18n translations
- [ ] Run TypeScript check
- [ ] Run production build

---

## Troubleshooting

### TypeScript Errors

**Issue**: Type errors in Help Centre components

**Solution**: Ensure all interfaces match:
```typescript
import { HelpCategory, HelpArticle } from '@/lib/helpMockData';
```

### Missing Translations

**Issue**: Translation keys not found

**Solution**: Check all language files have the key:
```bash
grep -r "help.feedback.question" messages/
```

### 404 on Category/Article Pages

**Issue**: Dynamic routes not working

**Solution**: Check slug format in mock data matches URL:
```typescript
// Mock data
slug: "getting-started"  // Must match URL segment

// URL
/resources/faq/getting-started  // Must match slug
```

### Search Not Working

**Issue**: Search form submits but nothing happens

**Solution**: Implement search handler:
```typescript
const onSubmit = (data: SearchFormData) => {
  // Add your search implementation here
  console.log("Search query:", data.query);
};
```

---

## Performance Tips

1. **Static Generation**: Use `generateStaticParams()` for known categories
2. **ISR**: Enable revalidation for CMS content updates
3. **Image Optimization**: Use Next.js Image component for hero images
4. **Code Splitting**: Keep components client-side only when needed
5. **Caching**: Cache category/article data at CDN edge

---

## Testing Checklist

- [ ] Landing page loads correctly
- [ ] All 6 category cards are visible
- [ ] Category pages show correct articles
- [ ] Article pages display full content
- [ ] Breadcrumbs work on all pages
- [ ] Search field validates input
- [ ] Feedback widget responds to clicks
- [ ] Related articles link correctly
- [ ] Empty states display when no articles
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] i18n works for all 4 languages
- [ ] SEO metadata is correct
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds

---

## Resources

- **Full Documentation**: `docs/HELP_CENTRE_COMPLETE.md`
- **Completion Report**: `AGENT_25_HELP_CENTRE_COMPLETION_REPORT.md`
- **CMS Schema**: `docs/CMS_SCHEMA.md`
- **Route Helpers**: `src/lib/routes.ts`
- **SEO Utilities**: `src/lib/seo.ts`

---

**Last Updated**: December 3, 2025  
**Version**: 1.0.0  
**Status**: Production-Ready
