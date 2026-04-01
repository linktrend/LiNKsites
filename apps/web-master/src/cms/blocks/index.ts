// @ts-nocheck - Payload CMS types will be available after installation
import { Block } from 'payload/types';

/**
 * Unified Block System for Website Template
 * 
 * All page collections use these blocks in their layout[] field.
 * This ensures consistency across homepage, about, offers, case studies, articles, etc.
 */

// Hero Block - Main page header with CTA
export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: {
        description: 'Main heading text',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      admin: {
        description: 'Secondary heading or tagline',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      admin: {
        description: 'Body text or description',
      },
    },
    {
      name: 'badge',
      type: 'text',
      admin: {
        description: 'Optional badge text (e.g., "New", "Featured")',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      admin: {
        description: 'Call-to-action button text',
      },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      admin: {
        description: 'Call-to-action button URL',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background image for hero section',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured media (image or video)',
      },
    },
    {
      name: 'socialProof',
      type: 'array',
      admin: {
        description: 'Social proof items (testimonials, media mentions)',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Testimonial', value: 'testimonial' },
            { label: 'Media Mention', value: 'media' },
          ],
        },
        { name: 'quote', type: 'text' },
        { name: 'author', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'publication', type: 'text' },
      ],
    },
  ],
};

// Features Block - Grid of features/benefits
export const FeaturesBlock: Block = {
  slug: 'features',
  labels: {
    singular: 'Features Section',
    plural: 'Features Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      admin: {
        description: 'Feature items',
      },
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Icon name or identifier',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'linkText',
          type: 'text',
        },
        {
          name: 'linkUrl',
          type: 'text',
        },
      ],
    },
  ],
};

// Pricing Block - Pricing tables
export const PricingBlock: Block = {
  slug: 'pricing',
  labels: {
    singular: 'Pricing Section',
    plural: 'Pricing Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'monthlyLabel',
      type: 'text',
      defaultValue: 'Monthly',
    },
    {
      name: 'yearlyLabel',
      type: 'text',
      defaultValue: 'Yearly',
    },
    {
      name: 'plans',
      type: 'array',
      admin: {
        description: 'Pricing plans',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'monthlyPrice',
          type: 'text',
        },
        {
          name: 'yearlyPrice',
          type: 'text',
        },
        {
          name: 'ctaText',
          type: 'text',
        },
        {
          name: 'featuresLabel',
          type: 'text',
        },
        {
          name: 'features',
          type: 'array',
          fields: [
            {
              name: 'feature',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'popular',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
};

// Testimonials Block - Customer testimonials
export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonials Section',
    plural: 'Testimonials Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'testimonials',
      type: 'array',
      admin: {
        description: 'Testimonial items',
      },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
        {
          name: 'author',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
};

// CTA Block - Call-to-action section
export const CtaBlock: Block = {
  slug: 'cta',
  labels: {
    singular: 'CTA Section',
    plural: 'CTA Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'ctaUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'trustIndicators',
      type: 'array',
      admin: {
        description: 'Trust indicators (e.g., "No credit card required")',
      },
      fields: [
        {
          name: 'indicator',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};

// FAQ Block - Frequently asked questions
export const FaqBlock: Block = {
  slug: 'faq',
  labels: {
    singular: 'FAQ Section',
    plural: 'FAQ Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        description: 'FAQ items',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
        },
      ],
    },
  ],
};

// Rich Text Block - General content block
export const RichTextBlock: Block = {
  slug: 'richText',
  labels: {
    singular: 'Rich Text Content',
    plural: 'Rich Text Content',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Rich text content',
      },
    },
  ],
};

// Content Block - Alias for Rich Text (backward compatibility)
export const ContentBlock: Block = {
  slug: 'content',
  labels: {
    singular: 'Content Block',
    plural: 'Content Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Content block',
      },
    },
  ],
};

// Media Block - Image or video display
export const MediaBlock: Block = {
  slug: 'media',
  labels: {
    singular: 'Media Block',
    plural: 'Media Blocks',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'altText',
      type: 'text',
      admin: {
        description: 'Alternative text for accessibility',
      },
    },
  ],
};

// Articles Block - Display article grid
export const ArticlesBlock: Block = {
  slug: 'articles',
  labels: {
    singular: 'Articles Section',
    plural: 'Articles Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'resources',
      hasMany: true,
      admin: {
        description: 'Select articles to display',
      },
    },
  ],
};

// Case Studies Block - Display case study grid
export const CaseStudiesBlock: Block = {
  slug: 'caseStudies',
  labels: {
    singular: 'Case Studies Section',
    plural: 'Case Studies Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'caseStudies',
      type: 'relationship',
      relationTo: 'cases',
      hasMany: true,
      admin: {
        description: 'Select case studies to display',
      },
    },
  ],
};

// Offer Showcase Block - Display offer cards
export const OfferShowcaseBlock: Block = {
  slug: 'offerShowcase',
  labels: {
    singular: 'Offer Showcase',
    plural: 'Offer Showcases',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'offers',
      type: 'relationship',
      relationTo: 'offers',
      hasMany: true,
      admin: {
        description: 'Select offers to display',
      },
    },
  ],
};

// Newsletter Block - Newsletter signup
export const NewsletterBlock: Block = {
  slug: 'newsletter',
  labels: {
    singular: 'Newsletter Section',
    plural: 'Newsletter Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle',
      },
    },
    {
      name: 'placeholder',
      type: 'text',
      admin: {
        description: 'Email input placeholder',
      },
    },
    {
      name: 'buttonText',
      type: 'text',
      admin: {
        description: 'Submit button text',
      },
    },
  ],
};

// Trust Feed Block - External reviews (positive-only filter)
export const TrustFeedBlock: Block = {
  slug: 'trustFeed',
  labels: {
    singular: 'Trust Feed',
    plural: 'Trust Feeds',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'minRating',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 5,
      admin: {
        description: 'Minimum rating to display (default 4)',
      },
    },
    {
      name: 'allowPositiveOnly',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Only show reviews at or above the minimum rating',
      },
    },
    {
      name: 'reviews',
      type: 'array',
      admin: {
        description: 'Review entries from approved sources',
      },
      fields: [
        { name: 'platform', type: 'text' },
        { name: 'rating', type: 'number', min: 1, max: 5 },
        { name: 'quote', type: 'textarea' },
        { name: 'author', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
};

// Export all blocks as an array for easy registration
export const allBlocks = [
  HeroBlock,
  FeaturesBlock,
  PricingBlock,
  TestimonialsBlock,
  CtaBlock,
  FaqBlock,
  RichTextBlock,
  ContentBlock,
  MediaBlock,
  ArticlesBlock,
  CaseStudiesBlock,
  OfferShowcaseBlock,
  NewsletterBlock,
  TrustFeedBlock,
];
