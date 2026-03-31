# Infinite Product Carousel - Implementation Notes

## Overview

The infinite product carousel is implemented following the [Webflow Infinite Clients Slider](https://webflow.com/made-in-webflow/website/infinite-clients-slider) pattern.

## How It Works

### 1. Structure

```
<div class="overflow-hidden">                    ← Container (hides overflow)
  <div class="flex animate-infinite-scroll">     ← Track (animated)
    <div class="flex gap-12">                    ← First set of logos
      [Logo 1] [Logo 2] [Logo 3] ... [Logo 8]
    </div>
    <div class="flex gap-12">                    ← Duplicate set (for seamless loop)
      [Logo 1] [Logo 2] [Logo 3] ... [Logo 8]
    </div>
  </div>
</div>
```

### 2. Animation

The animation uses CSS keyframes to translate the entire track:

```css
@keyframes infinite-scroll {
  from {
    transform: translateX(0);      /* Start at original position */
  }
  to {
    transform: translateX(-50%);   /* Move left by 50% (one full set) */
  }
}

.animate-infinite-scroll {
  animation: infinite-scroll 30s linear infinite;
}
```

**Why -50%?**
- The track contains 2 identical sets of logos (100% total width)
- Moving -50% shifts exactly one full set to the left
- When it reaches -50%, it loops back to 0
- Because the sets are identical, the loop is seamless

### 3. Visual Flow

```
Time 0s:
[Logo1 Logo2 Logo3 Logo4] [Logo1 Logo2 Logo3 Logo4]
^viewport^

Time 15s (halfway):
                [Logo1 Logo2 Logo3 Logo4] [Logo1 Logo2 Logo3 Logo4]
                ^viewport^

Time 30s (end, loops to start):
[Logo1 Logo2 Logo3 Logo4] [Logo1 Logo2 Logo3 Logo4]
^viewport^
```

The viewer never sees a jump because the second set looks identical to the first.

## Key Features

### Pause on Hover
```css
.pause-animation:hover {
  animation-play-state: paused;
}
```

### Grayscale Effect
```css
.grayscale {
  filter: grayscale(100%);
  opacity: 0.6;
}

.grayscale:hover {
  filter: grayscale(0%);
  opacity: 1;
}
```

### Smooth Transitions
```css
transition-all duration-300
```

## Configuration Options

### Speed Adjustment
Change the animation duration:
- **Faster:** `animation: infinite-scroll 20s linear infinite;`
- **Slower:** `animation: infinite-scroll 40s linear infinite;`

### Direction
Reverse the scroll direction:
```css
@keyframes infinite-scroll-reverse {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}
```

### Gap Between Logos
Adjust spacing in the component:
```tsx
<div className="flex items-center gap-12 px-6">  // Change gap-12 to gap-8, gap-16, etc.
```

## Logo Specifications

### Recommended Dimensions
- **Width:** Variable (maintain aspect ratio)
- **Height:** 64px (h-16 in Tailwind)
- **Format:** PNG with transparency
- **Color:** Monochrome or full color (will be grayscaled)

### Logo Container
```tsx
<div className="flex-shrink-0 h-16 w-32 relative">
  <Image
    src={logo.logoUrl}
    alt={logo.name}
    fill
    className="object-contain"  // Maintains aspect ratio
  />
</div>
```

## Responsive Behavior

### Mobile
- Logos maintain same size
- Fewer logos visible in viewport
- Animation speed stays constant
- Touch-friendly (no hover effects on mobile)

### Tablet
- More logos visible
- Hover effects active
- Smooth scrolling maintained

### Desktop
- Full set of logos visible
- All hover effects active
- Optimal viewing experience

## Performance Considerations

### GPU Acceleration
The `transform` property is GPU-accelerated, ensuring smooth animation even with many logos.

### Lazy Loading
Logos outside the viewport can be lazy-loaded:
```tsx
<Image
  src={logo.logoUrl}
  alt={logo.name}
  fill
  loading="lazy"  // Add this for off-screen logos
/>
```

### Reduced Motion
Respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-infinite-scroll {
    animation: none;
  }
}
```

## CMS Integration

### Minimum Logos Required
**At least 6-8 logos** are recommended for smooth infinite scrolling. With fewer logos:
- Increase logo size
- Increase gap between logos
- Or slow down animation

### Dynamic Logo Count
The component automatically handles any number of logos:
```tsx
{productLogos.map((logo) => (
  // Logo component
))}
```

The duplication ensures seamless looping regardless of count.

## Troubleshooting

### Issue: Logos appear stretched
**Solution:** Use `object-contain` instead of `object-cover`

### Issue: Animation has visible jump
**Solution:** Ensure both logo sets are identical and -50% translation is used

### Issue: Animation is too fast/slow
**Solution:** Adjust duration in the animation (20s-40s recommended)

### Issue: Logos not visible
**Solution:** Check container has `overflow-hidden` and logos have proper dimensions

### Issue: Hover pause not working
**Solution:** Ensure `pause-animation` class is on the animated element

## Browser Support

✅ **Fully Supported:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android Chrome 90+)

⚠️ **Fallback:**
For older browsers, the carousel will still display but may not animate smoothly.

## Example Usage

```tsx
// In CMS data:
const productLogos = [
  { id: 1, name: "Company A", logoUrl: "/logos/company-a.png" },
  { id: 2, name: "Company B", logoUrl: "/logos/company-b.png" },
  { id: 3, name: "Company C", logoUrl: "/logos/company-c.png" },
  // ... more logos
];

// Component automatically:
// 1. Renders all logos
// 2. Duplicates them for infinite loop
// 3. Animates continuously
// 4. Pauses on hover
// 5. Shows color on hover
```

## Accessibility

### Screen Readers
- First set: Announced to screen readers
- Duplicate set: Hidden with `aria-hidden="true"`

### Keyboard Navigation
- Logos can receive focus if they're links
- Animation doesn't interfere with keyboard navigation

### Motion Sensitivity
- Respects `prefers-reduced-motion` setting
- Provides alternative static display if needed

## References

- [Webflow Infinite Clients Slider](https://webflow.com/made-in-webflow/website/infinite-clients-slider)
- [CSS Transform Performance](https://web.dev/animations-guide/)
- [Infinite Scroll Pattern](https://css-tricks.com/infinite-all-css-scrolling-slideshow/)






