# Layout Blocks Testing Checklist

## Pre-Testing Setup

- [ ] CMS (Payload) is running and accessible
- [ ] Website development server is running
- [ ] Test data is seeded in CMS collections
- [ ] Environment variables are configured

## Block Rendering Tests

### Hero Block
- [ ] Heading displays correctly
- [ ] Subheading displays correctly
- [ ] Body text renders
- [ ] Badge displays when provided
- [ ] CTA button renders with correct label and URL
- [ ] Background image displays
- [ ] Social proof items render (if provided)
- [ ] Responsive layout works on mobile/tablet/desktop

### Features Block
- [ ] Title and subtitle display
- [ ] Feature items render in grid
- [ ] Icons display (if provided)
- [ ] Feature titles and descriptions show
- [ ] Links work when provided
- [ ] Grid is responsive (2 columns on desktop)
- [ ] Empty state shows when no items

### Pricing Block
- [ ] Title and subtitle display
- [ ] Pricing toggle works (monthly/yearly)
- [ ] Plans render in grid
- [ ] Prices calculate correctly for billing period
- [ ] Popular plan is highlighted
- [ ] Features list displays for each plan
- [ ] CTA buttons work
- [ ] Responsive on mobile (stacks vertically)

### Testimonials Block
- [ ] Title and subtitle display
- [ ] Testimonials render in grid
- [ ] Quotes display correctly
- [ ] Author names and roles show
- [ ] Avatar images display (if provided)
- [ ] Empty state shows when no testimonials
- [ ] Responsive grid layout

### CTA Block
- [ ] Title displays prominently
- [ ] Body text renders
- [ ] CTA button works with correct URL
- [ ] Trust indicators display as list
- [ ] Responsive layout
- [ ] Button styling is correct

### FAQ Block
- [ ] Title and subtitle display
- [ ] FAQ items render as accordion
- [ ] Click to expand/collapse works
- [ ] Questions display correctly
- [ ] Answers show when expanded
- [ ] Only one item open at a time (optional)
- [ ] Empty state shows when no items
- [ ] Accessible keyboard navigation

### Rich Text / Content Block
- [ ] Rich text content renders
- [ ] HTML formatting preserved
- [ ] Links are clickable
- [ ] Images in rich text display
- [ ] Lists (ordered/unordered) render
- [ ] Headings have correct hierarchy
- [ ] Code blocks display (if used)
- [ ] Responsive text layout

### Media Block
- [ ] Image displays correctly
- [ ] Alt text is set for accessibility
- [ ] Caption displays (if provided)
- [ ] Image is responsive
- [ ] Fallback works if image fails
- [ ] Video embeds work (if supported)

### Articles Block
- [ ] Title and subtitle display
- [ ] Selected articles render in grid
- [ ] Article thumbnails display
- [ ] Article titles and excerpts show
- [ ] Links to articles work
- [ ] Responsive grid layout
- [ ] Empty state when no articles selected

### Case Studies Block
- [ ] Title and subtitle display
- [ ] Selected case studies render
- [ ] Case study thumbnails display
- [ ] Titles and summaries show
- [ ] Links to case studies work
- [ ] Responsive grid layout
- [ ] Empty state when no cases selected

### Offer Showcase Block
- [ ] Title and subtitle display
- [ ] Selected offers render
- [ ] Offer cards display correctly
- [ ] Titles and descriptions show
- [ ] Links to offers work
- [ ] Responsive grid layout
- [ ] Empty state when no offers selected

### Newsletter Block
- [ ] Title and subtitle display
- [ ] Email input field renders
- [ ] Placeholder text shows
- [ ] Submit button displays
- [ ] Form submission works
- [ ] Validation works (email format)
- [ ] Success/error messages show
- [ ] Responsive layout

## Page Type Tests

### Pages Collection
- [ ] Create new page with layout blocks
- [ ] Page renders correctly on frontend
- [ ] SEO metadata is applied
- [ ] Multiple blocks render in order
- [ ] Block reordering works in CMS
- [ ] Page slug routing works

### Offers Collection
- [ ] Create offer with layout blocks
- [ ] Offer page renders with layout
- [ ] Existing offer fields still work
- [ ] Layout blocks integrate with offer data
- [ ] Related content displays

### Cases Collection
- [ ] Create case study with layout blocks
- [ ] Case study page renders with layout
- [ ] Challenge/solution/impact sections work
- [ ] Layout blocks add additional content
- [ ] Related offers display

### Resources (Articles) Collection
- [ ] Create article with layout blocks
- [ ] Article page renders with layout
- [ ] Article body content displays
- [ ] Layout blocks add additional sections
- [ ] Related articles display

### FAQ Collection
- [ ] Create FAQ page with layout blocks
- [ ] FAQ page renders correctly
- [ ] FAQ block within layout works
- [ ] Multiple FAQ blocks can be added
- [ ] Categories work for filtering

### Legal Collection
- [ ] Create legal document with layout blocks
- [ ] Legal page renders with layout
- [ ] Document content displays
- [ ] Layout blocks add additional sections
- [ ] Version and date information shows

### Videos Collection
- [ ] Create video with layout blocks
- [ ] Video page renders with layout
- [ ] YouTube embed works
- [ ] Layout blocks add additional content
- [ ] Related videos display

## Integration Tests

### PageRenderer
- [ ] Handles empty layout array
- [ ] Shows fallback for missing blocks
- [ ] Renders unknown block types gracefully
- [ ] Maintains block order
- [ ] Passes locale to blocks correctly
- [ ] Debug logging works in development

### Navigation
- [ ] Pages appear in navigation
- [ ] Links to pages work
- [ ] Breadcrumbs show correct hierarchy
- [ ] Active page is highlighted

### SEO
- [ ] Meta title is set correctly
- [ ] Meta description is set
- [ ] OG image is set (if provided)
- [ ] Canonical URL is set
- [ ] Structured data renders

### Performance
- [ ] Pages load in reasonable time
- [ ] Images are optimized
- [ ] No layout shift on load
- [ ] Blocks render progressively
- [ ] Build time is acceptable

## Accessibility Tests

- [ ] All blocks have proper heading hierarchy
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Forms have labels
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible

## Responsive Tests

- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Large desktop (1440px+)
- [ ] Touch interactions work on mobile
- [ ] Hover states work on desktop

## Browser Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Migration Tests

### Old to New System
- [ ] Old Pages sections convert to layout blocks
- [ ] Old Offers body_content migrates to rich text block
- [ ] Old Cases challenge/solution/impact migrate
- [ ] Old Articles body migrates to rich text block
- [ ] Old FAQ items convert to FAQ pages
- [ ] Old Legal body migrates to rich text block

### Backward Compatibility
- [ ] Pages with old structure still render
- [ ] Deprecated fields still accessible
- [ ] No data loss during migration
- [ ] Both old and new systems work simultaneously

## Edge Cases

- [ ] Empty blocks (no content)
- [ ] Very long content
- [ ] Special characters in text
- [ ] Missing images (fallback)
- [ ] Missing relationships (empty arrays)
- [ ] Unpublished related content
- [ ] Invalid URLs
- [ ] Malformed HTML in rich text

## Build & Deploy Tests

- [ ] TypeScript compilation passes
- [ ] Linting passes
- [ ] Build completes successfully
- [ ] No console errors in production
- [ ] Static pages generate correctly
- [ ] Dynamic pages work
- [ ] API routes function

## Documentation Tests

- [ ] MIGRATION_GUIDE.md is accurate
- [ ] LAYOUT_BLOCKS_GUIDE.md is helpful
- [ ] Code comments are clear
- [ ] Type definitions are documented
- [ ] Examples are provided

## Sign-off

- [ ] All critical tests pass
- [ ] Known issues are documented
- [ ] Migration plan is approved
- [ ] Team is trained on new system
- [ ] Rollback plan is in place

---

## Notes

Use this checklist to ensure the unified layout system works correctly across all page types and scenarios. Mark items as complete as you test them. Document any issues or unexpected behavior.
