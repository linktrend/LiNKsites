import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";

export type PageBlockCommon = {
  id?: string;
  blockType?: string;
  label?: string;
};

export type HeroBlock = PageBlockCommon & {
  blockType: "hero";
  badge?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  backgroundImage?: any;
  cta?: {
    text?: string;
    url?: string;
    style?: string;
  };
  media?: any;
  socialProof?: Array<{
    quote?: string;
    author?: string;
    title?: string;
    publication?: string;
  }>;
};

export type FeaturesBlock = PageBlockCommon & {
  blockType: "features";
  title?: string;
  subtitle?: string;
  items?: Array<{
    id?: string;
    icon?: string;
    title?: string;
    description?: string;
    linkText?: string;
    linkUrl?: string;
  }>;
};

export type PricingBlock = PageBlockCommon & {
  blockType: "pricing";
  title?: string;
  subtitle?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  plans?: Array<{
    id?: string;
    name?: string;
    description?: string;
    price?: string;
    period?: string;
    cta?: { text?: string; url?: string };
    featuresLabel?: string;
    features?: Array<{ feature?: string; included?: boolean } | string>;
    highlighted?: boolean;
  }>;
};

export type TestimonialsBlock = PageBlockCommon & {
  blockType: "testimonials";
  title?: string;
  subtitle?: string;
  testimonials?: Array<{
    id?: string;
    quote?: string;
    author?: string;
    role?: string;
    avatar?: any;
  }>;
  items?: Array<{
    id?: string;
    quote?: string;
    author?: string;
    role?: string;
    avatar?: any;
  }>;
};

export type CtaBlock = PageBlockCommon & {
  blockType: "cta";
  title?: string;
  text?: string;
  button?: { text?: string; url?: string; style?: string };
  backgroundColor?: string;
  trustIndicators?: string[];
};

export type FaqBlock = PageBlockCommon & {
  blockType: "faq";
  title?: string;
  subtitle?: string;
  questions?: Array<{
    id?: string;
    question?: string;
    answer?: unknown;
  }>;
};

export type RichTextBlock = PageBlockCommon & {
  blockType: "richText" | "content";
  content?: string | unknown;
};

export type MediaBlock = PageBlockCommon & {
  blockType: "media";
  media?: any;
  caption?: string;
  altText?: string;
};

export type ArticlesBlock = PageBlockCommon & {
  blockType: "articles";
  title?: string;
  subtitle?: string;
  items?: any[];
};

export type CaseStudiesBlock = PageBlockCommon & {
  blockType: "caseStudies";
  title?: string;
  subtitle?: string;
  items?: any[];
};

export type OfferShowcaseBlock = PageBlockCommon & {
  blockType: "offerShowcase";
  title?: string;
  subtitle?: string;
  offers?: any[];
};

export type NewsletterBlock = PageBlockCommon & {
  blockType: "newsletter";
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonLabel?: string;
};

export type CalloutBlock = PageBlockCommon & {
  blockType: "callout";
  type?: "info" | "warning" | "success" | "error" | string;
  message?: unknown;
  icon?: string;
};

export type VideoEmbedBlock = PageBlockCommon & {
  blockType: "videoEmbed";
  youtubeId?: string;
  caption?: string;
  autoplay?: boolean;
  controls?: boolean;
  aspectRatio?: string;
};

export type RelatedContentBlock = PageBlockCommon & {
  blockType: "relatedContent";
  title?: string;
  content?: any[];
  displayStyle?: string;
};

export type SingleTestimonialBlock = PageBlockCommon & {
  blockType: "testimonial";
  quote?: string;
  author?: string;
  company?: string;
  role?: string;
  image?: any;
};

export type TrustFeedBlock = PageBlockCommon & {
  blockType: "trustFeed";
  title?: string;
  minRating?: number;
  allowPositiveOnly?: boolean;
  reviews?: Array<{
    platform?: string;
    rating?: number;
    quote?: string;
    author?: string;
    url?: string;
  }>;
};

export type CmsPageBlock =
  | HeroBlock
  | FeaturesBlock
  | PricingBlock
  | TestimonialsBlock
  | CtaBlock
  | FaqBlock
  | RichTextBlock
  | MediaBlock
  | ArticlesBlock
  | CaseStudiesBlock
  | OfferShowcaseBlock
  | NewsletterBlock
  | (PageBlockCommon & { blockType: "locations"; title?: string; subtitle?: string; items?: any[] })
  | (PageBlockCommon & { blockType: "teamMembers"; title?: string; subtitle?: string; items?: any[] })
  | CalloutBlock
  | VideoEmbedBlock
  | RelatedContentBlock
  | SingleTestimonialBlock
  | TrustFeedBlock
  | (PageBlockCommon & Record<string, unknown>);

// Block type map for type-safe block resolution
export type CmsBlockMap = {
  hero: HeroBlock;
  features: FeaturesBlock;
  pricing: PricingBlock;
  testimonials: TestimonialsBlock;
  cta: CtaBlock;
  faq: FaqBlock;
  richText: RichTextBlock;
  content: RichTextBlock;
  media: MediaBlock;
  articles: ArticlesBlock;
  caseStudies: CaseStudiesBlock;
  offerShowcase: OfferShowcaseBlock;
  newsletter: NewsletterBlock;
  locations: PageBlockCommon & { blockType: "locations"; title?: string; subtitle?: string; items?: any[] };
  teamMembers: PageBlockCommon & { blockType: "teamMembers"; title?: string; subtitle?: string; items?: any[] };
  callout: CalloutBlock;
  videoEmbed: VideoEmbedBlock;
  relatedContent: RelatedContentBlock;
  testimonial: SingleTestimonialBlock;
  trustFeed: TrustFeedBlock;
};

export type CmsPageSeo = {
  title?: string;
  description?: string;
  ogImage?: any;
  canonicalUrl?: string;
};

export interface CmsPage {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  pageType?: string;
  content: CmsPageBlock[];
  seo?: CmsPageSeo;
  reviewedAt?: string | null;
  reviewedBy?: { id?: string | number; name?: string; email?: string } | string | null;
}

type GetPageArgs = {
  siteId: string;
  locale: string;
  slugSegments: string[];
};

export const getPageBySlug = async ({
  siteId,
  locale,
  slugSegments,
}: GetPageArgs): Promise<CmsPage | null> => {
  const slug = slugSegments.length > 0 ? slugSegments.join("/") : "home";

  const where = {
    and: [...siteLocaleFilter(siteId, locale).and, { slug: { equals: slug } }],
  };

  const result = await payloadFind<CmsPage>({
    collection: "pages",
    where,
    limit: 1,
    depth: 2,
    locale,
    site: siteId,
  });

  return result.docs[0] ?? null;
};

export const getHomepage = async ({
  siteId,
  locale,
}: {
  siteId: string;
  locale: string;
}): Promise<CmsPage | null> => getPageBySlug({ siteId, locale, slugSegments: ["home"] });
