import { ReactNode } from "react";
import Image from "next/image";

import { NewsletterSection } from "@/components/common/NewsletterSection";
import { CTASection } from "@/components/marketing/CTASection";
import { CaseStudiesGrid } from "@/components/marketing/CaseStudiesGrid";
import { DynamicBgSection } from "@/components/marketing/DynamicBgSection";
import { OfferShowcase } from "@/components/marketing/OfferShowcase";
import { ArticlesGrid } from "@/components/marketing/ArticlesGrid";
import { PricingHomepage } from "@/components/marketing/PricingHomepage";
import { ScrollIndicator } from "@/components/marketing/ScrollIndicator";
import { SignupHero } from "@/components/marketing/SignupHero";
import { CmsPage, CmsPageBlock, HeroBlock, FeaturesBlock, PricingBlock, TestimonialsBlock, CtaBlock, FaqBlock, RichTextBlock, MediaBlock, ArticlesBlock, CaseStudiesBlock, OfferShowcaseBlock, NewsletterBlock, CalloutBlock, RelatedContentBlock, VideoEmbedBlock, SingleTestimonialBlock, TrustFeedBlock } from "@/lib/repository/pages";
import { CmsCaseStudy } from "@/lib/repository/caseStudies";
import { CmsArticle } from "@/lib/repository/articles";
import { CmsTestimonial } from "@/lib/repository/testimonials";
import { CmsFaq } from "@/lib/repository/faq";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImageWithFallback } from "@/lib/imageFallback";

type PageRendererProps = {
  page: CmsPage;
  primaryNav?: unknown;
  footerNav?: unknown;
  siteKey: string;
  locale: string;
};

export const PageRenderer = ({ page, siteKey, locale }: PageRendererProps) => {
  const layoutBlocks = Array.isArray(page.content) ? page.content : [];
  if (process.env.NODE_ENV !== "production") {
    const summary = layoutBlocks.map((block) => block?.blockType ?? "unknown");
    console.debug("[PageRenderer] rendering page", {
      siteKey,
      locale,
      slug: page.slug,
      content: summary,
    });
  }

  if (layoutBlocks.length === 0) {
    console.warn("[PageRenderer] No layout blocks found for page", page.slug);
    return (
      <div className="container py-12 space-y-4">
        <Card>
          <CardContent className="py-8">
            <p className="text-lg font-semibold">No content available for this page.</p>
            <p className="text-muted-foreground">Add blocks in Payload CMS to render this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {layoutBlocks.map((block, index) => (
        <section key={block.id ?? `${block.blockType}-${index}`} className="scroll-mt-20">
          {renderBlock(block, locale, page.slug)}
        </section>
      ))}
    </div>
  );
};

const renderBlock = (block: CmsPageBlock, locale: string, pageSlug?: string): ReactNode => {
  const type = block.blockType;

  switch (type) {
    case "hero":
      return <HeroSection block={block as HeroBlock} locale={locale} pageSlug={pageSlug} />;
    case "features":
      return <FeaturesSection block={block as FeaturesBlock} locale={locale} />;
    case "pricing":
      return <PricingSection block={block as PricingBlock} locale={locale} />;
    case "testimonials":
      return <TestimonialsSection block={block as TestimonialsBlock} />;
    case "cta":
      return <CtaSection block={block as CtaBlock} locale={locale} />;
    case "faq":
      return <FaqSection block={block as FaqBlock} />;
    case "richText":
    case "content":
      return <RichTextSection block={block as RichTextBlock} />;
    case "media":
      return <MediaSection block={block as MediaBlock} />;
    case "callout":
      return <CalloutSection block={block as CalloutBlock} />;
    case "videoEmbed":
      return <VideoEmbedSection block={block as VideoEmbedBlock} />;
    case "relatedContent":
      return <RelatedContentSection block={block as RelatedContentBlock} locale={locale} />;
    case "testimonial":
      return <SingleTestimonialSection block={block as SingleTestimonialBlock} />;
    case "trustFeed":
      return <TrustFeedSection block={block as TrustFeedBlock} />;
    case "locations":
      return <LocationsSection block={block as any} />;
    case "teamMembers":
      return <TeamMembersSection block={block as any} />;
    case "offerShowcase":
      return (
        <div className="bg-muted/30 py-12 sm:py-14">
          <OfferShowcase lang={locale} offers={(block as OfferShowcaseBlock).offers ?? []} />
        </div>
      );
    case "caseStudies":
      return (
        <div className="py-12 sm:py-14">
          <div className="container px-4 sm:px-6">
            <CaseStudiesGrid
              lang={locale}
              cases={(((block as CaseStudiesBlock).items ?? (block as any).caseStudies) ?? []) as CmsCaseStudy[]}
            />
          </div>
        </div>
      );
    case "articles":
      return (
        <div className="py-12 sm:py-14 bg-muted/30">
          <div className="container px-4 sm:px-6">
            <ArticlesGrid
              lang={locale}
              articles={(((block as ArticlesBlock).items ?? (block as any).articles) ?? []) as CmsArticle[]}
            />
          </div>
        </div>
      );
    case "newsletter":
      return <NewsletterSection lang={locale} />;
    default:
      console.warn("[PageRenderer] Unknown block type", type, block);
      return (
        <div className="container px-4 sm:px-6 py-8">
          <Card className="border border-dashed">
            <CardContent className="py-6">
              <p className="text-sm font-semibold">Unsupported block type</p>
              <p className="text-muted-foreground text-sm">
                Block type {type ?? "unknown"} is not mapped in the template.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
};

const HeroSection = ({ block, locale, pageSlug }: { block: HeroBlock; locale: string; pageSlug?: string }) => {
  const heading = block.title ?? "Welcome";
  const subheading = block.subtitle ?? block.body ?? "";
  const ctaLabel = block.cta?.text ?? "Get started";
  const ctaUrl = block.cta?.url ?? `/${locale}/contact`;
  const socialProof = Array.isArray(block.socialProof) ? block.socialProof : [];
  const backgroundImage = block.backgroundImage ? getImageWithFallback(block.backgroundImage, "hero") : undefined;
  const isHome = pageSlug === "home";

  return (
    <DynamicBgSection backgroundImage={backgroundImage}>
      <div className={isHome ? "container mx-auto px-4 sm:px-6 py-10 sm:py-12 text-white" : "container mx-auto px-4 sm:px-6 py-10 sm:py-12 text-white"}>
        {isHome ? (
          <div className="grid gap-8 lg:grid-cols-3 items-center">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                {block.badge ? (
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {block.badge}
                  </span>
                ) : null}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">{heading}</h1>
                {subheading ? <p className="text-lg text-white/80 leading-relaxed">{subheading}</p> : null}
              </div>

              {socialProof.length > 0 ? (
                <div className="space-y-3">
                  {socialProof.slice(0, 3).map((item, idx) => (
                    <Card key={idx} className="bg-white/10 border-white/20 text-white">
                      <CardContent className="p-4 space-y-1">
                        {item.publication ? (
                          <p className="text-xs uppercase tracking-wide text-white/70">{item.publication}</p>
                        ) : null}
                        {item.quote ? <p className="text-sm leading-relaxed">{item.quote}</p> : null}
                        {item.author || item.title ? (
                          <p className="text-xs text-white/70">
                            {[item.author, item.title].filter(Boolean).join(" • ")}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <a href={ctaUrl} data-ai-action="contact" data-ai-action-target={ctaUrl}>{ctaLabel}</a>
                </Button>
                <ScrollIndicator />
              </div>
            </div>

            <div className="order-first lg:order-none">
              <SignupHero lang={locale} />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4 text-center">
            {block.badge ? (
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {block.badge}
              </span>
            ) : null}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">{heading}</h1>
            {subheading ? <p className="text-lg text-white/80 leading-relaxed">{subheading}</p> : null}
          </div>
        )}
      </div>
    </DynamicBgSection>
  );
};

const FeaturesSection = ({ block, locale }: { block: FeaturesBlock; locale: string }) => {
  const title = block.title ?? "Features";
  const subtitle = block.subtitle ?? "What you get";
  const items = Array.isArray(block.items) ? block.items : [];

  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">No features available for this block.</p>
            </CardContent>
          </Card>
        ) : (
          items.map((item, index) => (
            <Card key={item.id ?? index} className="h-full border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                {item.linkText && item.linkUrl ? (
                  <CardDescription>
                    <a href={item.linkUrl} className="text-primary hover:underline">
                      {item.linkText}
                    </a>
                  </CardDescription>
                ) : null}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const PricingSection = ({ block, locale }: { block: PricingBlock; locale: string }) => {
  const plans = Array.isArray(block.plans) ? block.plans : [];
  const normalizedPlans = plans.map((plan: any) => ({
    name: plan?.name,
    description: plan?.description,
    monthlyPrice: plan?.monthlyPrice ?? plan?.price,
    yearlyPrice: plan?.yearlyPrice ?? plan?.price,
    ctaText: plan?.ctaText ?? plan?.cta?.text,
    featuresLabel: plan?.featuresLabel,
    features: plan?.features,
    popular: plan?.popular ?? plan?.highlighted,
  }));
  return (
    <div className="py-12 sm:py-14">
      <PricingHomepage
        lang={locale}
        plans={normalizedPlans as any[]}
        heading={block.title}
        subheading={block.subtitle}
        monthlyLabel={block.monthlyLabel}
        yearlyLabel={block.yearlyLabel}
      />
    </div>
  );
};

const TestimonialsSection = ({ block }: { block: TestimonialsBlock }) => {
  const testimonials = Array.isArray((block as any).items)
    ? ((block as any).items as any[])
    : Array.isArray((block as any).testimonials)
      ? ((block as any).testimonials as any[])
      : [];

  const quoteToText = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    const children = (value as any)?.root?.children ?? [];
    const parts: string[] = [];
    for (const node of children) {
      const text = (node?.children ?? []).map((c: any) => c?.text ?? "").join(" ").trim();
      if (text) parts.push(text);
    }
    return parts.join("\n\n");
  };

  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{block.title ?? "Testimonials"}</h2>
        {block.subtitle ? <p className="text-lg text-muted-foreground">{block.subtitle}</p> : null}
      </div>
      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">No testimonials available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, idx) => (
            <Card key={testimonial.id ?? idx} className="h-full border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">“{quoteToText(testimonial.quote)}”</CardTitle>
                <CardDescription>
                  {[testimonial.author, testimonial.role].filter(Boolean).join(" • ")}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const CtaSection = ({ block, locale }: { block: CtaBlock; locale: string }) => {
  const body = (block as any).body ?? block.text;
  const ctaLabel = (block as any).ctaLabel ?? block.button?.text;
  const ctaUrl = (block as any).ctaUrl ?? block.button?.url;

  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14">
      <CTASection
        lang={locale}
        data={{
          title: block.title,
          body,
          ctaLabel,
          ctaUrl,
          trustIndicators: block.trustIndicators,
        }}
      />
    </div>
  );
};

const FaqSection = ({ block }: { block: FaqBlock }) => {
  const questions = Array.isArray((block as any).questions)
    ? ((block as any).questions as any[])
    : Array.isArray((block as any).items)
      ? ((block as any).items as any[])
      : [];

  const renderAnswer = (value: unknown) => {
    if (!value) return "No answer provided.";
    if (typeof value === "string") return value;
    // Minimal Lexical JSON -> plain text (good enough for FAQ answers).
    const children = (value as any)?.root?.children ?? [];
    const parts: string[] = [];
    for (const node of children) {
      const text = (node?.children ?? []).map((c: any) => c?.text ?? "").join(" ").trim();
      if (text) parts.push(text);
    }
    return parts.join("\n\n") || "No answer provided.";
  };

  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14 space-y-4">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{block.title ?? "FAQs"}</h2>
        {block.subtitle ? <p className="text-lg text-muted-foreground">{block.subtitle}</p> : null}
      </div>
      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">No FAQs configured for this block.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y rounded-lg border border-border overflow-hidden">
          {questions.map((item, idx) => (
            <details key={item.id ?? idx} className="group border-b border-border/60 last:border-none">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-semibold">
                {item.question ?? "Untitled question"}
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-wrap">
                {renderAnswer(item.answer)}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

const LocationsSection = ({ block }: { block: any }) => {
  const items = Array.isArray(block.items) ? block.items : [];
  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{block.title ?? "Locations"}</h2>
        {block.subtitle ? <p className="text-lg text-muted-foreground">{block.subtitle}</p> : null}
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">No locations selected.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((loc: any, idx: number) => (
            <Card key={loc?.id ?? idx} className="h-full border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">{loc?.name ?? "Location"}</CardTitle>
                <CardDescription>
                  {[loc?.city, loc?.state].filter(Boolean).join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {loc?.phone ? <p>Phone: {loc.phone}</p> : null}
                {loc?.email ? <p>Email: {loc.email}</p> : null}
                {loc?.street ? <p>{[loc.street, loc.zip].filter(Boolean).join(" ")}</p> : null}
                {loc?.mapUrl ? (
                  <p>
                    <a className="text-primary hover:underline" href={loc.mapUrl} target="_blank" rel="noreferrer">
                      View on map
                    </a>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const TeamMembersSection = ({ block }: { block: any }) => {
  const items = Array.isArray(block.items) ? block.items : [];
  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{block.title ?? "Team"}</h2>
        {block.subtitle ? <p className="text-lg text-muted-foreground">{block.subtitle}</p> : null}
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">No team members selected.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((member: any, idx: number) => (
            <Card key={member?.id ?? idx} className="h-full border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">{member?.name ?? "Team Member"}</CardTitle>
                {member?.role ? <CardDescription>{member.role}</CardDescription> : null}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {member?.email ? <p>Email: {member.email}</p> : null}
                {member?.phone ? <p>Phone: {member.phone}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const CalloutSection = ({ block }: { block: CalloutBlock }) => {
  const type = block.type ?? "info";
  const icon = block.icon ? `${block.icon} ` : "";
  const message = (block.message as any)?.root ? (block.message as any) : block.message;
  const renderMessage = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    const children = (value as any)?.root?.children ?? [];
    return children
      .map((node: any) => (node?.children ?? []).map((c: any) => c?.text ?? "").join(" ").trim())
      .filter(Boolean)
      .join("\n\n");
  };
  const text = renderMessage(message);

  const tone =
    type === "error"
      ? "border-red-200 bg-red-50"
      : type === "warning"
        ? "border-amber-200 bg-amber-50"
        : type === "success"
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50";

  return (
    <div className="container px-4 sm:px-6 py-8">
      <Card className={`border ${tone}`}>
        <CardContent className="py-6 whitespace-pre-wrap text-sm text-slate-700">
          {icon}
          {text}
        </CardContent>
      </Card>
    </div>
  );
};

const VideoEmbedSection = ({ block }: { block: VideoEmbedBlock }) => {
  const raw = block.youtubeId ?? "";
  const id = raw.includes("youtube.com") || raw.includes("youtu.be")
    ? raw.split("v=")[1]?.split("&")[0] ?? raw.split("/").pop() ?? raw
    : raw;
  const aspect = block.aspectRatio ?? "16:9";
  const ratioClass = aspect === "1:1" ? "aspect-square" : aspect === "4:3" ? "aspect-[4/3]" : "aspect-video";
  const params = new URLSearchParams();
  if (block.autoplay) params.set("autoplay", "1");
  params.set("rel", "0");
  params.set("modestbranding", "1");
  if (block.controls === false) params.set("controls", "0");

  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14 space-y-3">
      <div className={`w-full overflow-hidden rounded-lg border border-border ${ratioClass}`}>
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${encodeURIComponent(id)}?${params.toString()}`}
          title={block.caption ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {block.caption ? <p className="text-sm text-muted-foreground">{block.caption}</p> : null}
    </div>
  );
};

const RelatedContentSection = ({ block, locale }: { block: RelatedContentBlock; locale: string }) => {
  const items = Array.isArray(block.content) ? block.content : [];
  const resolveLink = (item: any): string => {
    // Polymorphic relationships can come as { relationTo, value } or directly as doc.
    const relationTo = item?.relationTo ?? item?._relationTo;
    const doc = item?.value ?? item;
    const slug = doc?.slug;
    if (!slug) return "#";
    if (relationTo === "articles" || doc?.collection === "articles") return `/${locale}/resources/articles/${slug}`;
    if (relationTo === "case-study-pages" || doc?.collection === "case-study-pages") return `/${locale}/resources/cases/${slug}`;
    if (relationTo === "videos" || relationTo === "video-pages" || doc?.collection === "videos") return `/${locale}/resources/videos/${slug}`;
    return `/${locale}/${slug}`;
  };

  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{block.title ?? "Related Content"}</h2>
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">No related content selected.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item: any, idx: number) => {
            const doc = item?.value ?? item;
            const title = doc?.title ?? doc?.name ?? "Item";
            const href = resolveLink(item);
            return (
              <Card key={doc?.id ?? idx} className="h-full border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a className="hover:underline" href={href}>
                      {title}
                    </a>
                  </CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SingleTestimonialSection = ({ block }: { block: SingleTestimonialBlock }) => {
  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">“{block.quote ?? ""}”</CardTitle>
          <CardDescription>
            {[block.author, block.role, block.company].filter(Boolean).join(" • ")}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

const TrustFeedSection = ({ block }: { block: TrustFeedBlock }) => {
  const minRating = block.minRating ?? 4;
  const allowPositiveOnly = block.allowPositiveOnly !== false;
  const reviews = Array.isArray(block.reviews) ? block.reviews : [];
  const filtered = allowPositiveOnly
    ? reviews.filter((review) => (review.rating ?? 0) >= minRating)
    : reviews;

  if (filtered.length === 0) return null;

  return (
    <div className="container px-4 sm:px-6 py-12 sm:py-14">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">{block.title ?? "Trusted by customers"}</h2>
          <p className="text-sm text-muted-foreground">
            Showing {allowPositiveOnly ? `reviews rated ${minRating}+` : "all reviews"}.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((review, index) => (
            <Card key={review.url ?? index} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">
                  {review.platform ?? "Review"} • {review.rating ?? minRating}/5
                </CardTitle>
                <CardDescription>
                  {review.author ? `${review.author}` : "Verified reviewer"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">"{review.quote ?? ""}"</p>
                {review.url ? (
                  <a className="mt-2 inline-flex text-xs text-primary hover:underline" href={review.url}>
                    View source
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const RichTextSection = ({ block }: { block: RichTextBlock }) => {
  const content = block.content;
  if (!content) {
    return null;
  }

  // Handle string content (HTML or plain text)
  if (typeof content === "string") {
    return (
      <div className="container px-4 sm:px-6 py-12">
        <div className="prose max-w-4xl" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  // Handle rich text object (Payload CMS format)
  // In production, use a proper rich text serializer like @payloadcms/richtext-lexical
  if (typeof content === "object" && content !== null) {
    // Minimal serializer: render first heading and paragraphs, centered
    const children = (content as any)?.root?.children ?? [];
    const headingNode = children.find((n: any) => n.type === "heading");
    const paragraphNodes = children.filter((n: any) => n.type === "paragraph");
    const getText = (node: any) =>
      (node?.children ?? [])
        .map((c: any) => c.text ?? "")
        .join(" ");

    return (
      <div className="container px-4 sm:px-6 py-12">
        <div className="prose max-w-4xl mx-auto text-center space-y-4">
          {headingNode ? <h2 className="text-3xl font-bold">{getText(headingNode)}</h2> : null}
          {paragraphNodes.map((p: any, idx: number) => (
            <p key={idx} className="text-lg text-muted-foreground">
              {getText(p)}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const MediaSection = ({ block }: { block: MediaBlock }) => {
  if (!block.media) {
    return null;
  }

  const src = getImageWithFallback(block.media, "default");
  const altText = block.altText ?? block.caption ?? "Media content";

  return (
    <div className="container px-4 sm:px-6 py-10">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Image
            src={src}
            alt={altText}
            width={1600}
            height={900}
            className="w-full object-cover"
            sizes="100vw"
          />
        </CardContent>
        {(block.caption || block.altText) && (
          <CardHeader>
            <CardDescription>{block.caption ?? block.altText}</CardDescription>
          </CardHeader>
        )}
      </Card>
    </div>
  );
};
