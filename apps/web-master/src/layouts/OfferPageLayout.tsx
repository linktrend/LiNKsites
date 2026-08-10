"use client";

import { useState } from "react";
import Link from "next/link";
import { CmsOffer } from "@/lib/repository/offers";
import { CmsArticle as CmsResource } from "@/lib/repository/articles";
import { CmsCaseStudy as CmsCase } from "@/lib/repository/caseStudies";
import { CmsFaq } from "@/lib/repository/faq";
import { ChevronDown } from "lucide-react";
import { routes } from "@/lib/routes";

type Props = {
  lang: string;
  page: {
    data: {
      offer?: CmsOffer;
      resources: CmsResource[];
      caseStudies: CmsCase[];
      videos: unknown[];
      faqs: CmsFaq[];
    };
  };
};

/**
 * Offer content is CMS-owned. An absent relationship or field is rendered as
 * an absent section; it is never replaced with invented customer outcomes,
 * pricing, resources, FAQ answers, or security claims.
 */
export function OfferPageLayout({ lang, page }: Props) {
  const { offer, resources, caseStudies, faqs } = page.data;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!offer) return <div className="container py-12">Offer unavailable.</div>;

  const sections = [
    { title: "Features", items: offer.features ?? [] },
    { title: "Use cases", items: offer.useCases ?? [] },
    { title: "Pricing", items: offer.pricing ?? [] },
    { title: "Testimonials", items: offer.testimonials ?? [] },
  ].filter((section) => section.items.length > 0);

  return (
    <article className="min-h-screen bg-background">
      <header className="border-b py-16">
        <div className="container space-y-4">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Offer</p>
          <h1 className="text-4xl font-bold">{offer.title}</h1>
          {offer.subtitle ? <p className="text-lg text-muted-foreground">{offer.subtitle}</p> : null}
          {offer.description ? <p className="max-w-3xl text-muted-foreground">{offer.description}</p> : null}
          <Link className="inline-flex rounded-md border px-4 py-2" href={routes.contact(lang)}>
            Contact
          </Link>
        </div>
      </header>

      {sections.map((section) => (
        <section className="border-b py-12" key={section.title}>
          <div className="container space-y-6">
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {section.items.map((item, index) => (
                <li className="rounded-lg border p-4" key={`${section.title}-${index}`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {caseStudies.length > 0 ? (
        <section className="border-b py-12">
          <div className="container space-y-6">
            <h2 className="text-2xl font-semibold">Case studies</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {caseStudies.map((caseStudy) => (
                <Link
                  className="rounded-lg border p-4 hover:border-primary"
                  href={routes.caseStudy(lang, caseStudy.slug)}
                  key={caseStudy.slug}
                >
                  <h3 className="font-semibold">{caseStudy.title}</h3>
                  {caseStudy.summary ? <p className="mt-2 text-muted-foreground">{caseStudy.summary}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {faqs.length > 0 ? (
        <section className="border-b py-12">
          <div className="container max-w-4xl space-y-6">
            <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div className="overflow-hidden rounded-lg border" key={faq.id}>
                  <button
                    aria-controls={`offer-faq-answer-${index}`}
                    aria-expanded={openFaqIndex === index}
                    className="flex w-full items-center justify-between p-4 text-left"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    type="button"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown aria-hidden="true" className="h-5 w-5" />
                  </button>
                  {openFaqIndex === index && faq.answer ? (
                    <p className="border-t p-4 text-muted-foreground" id={`offer-faq-answer-${index}`}>
                      {faq.answer}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {resources.length > 0 ? (
        <section className="py-12">
          <div className="container space-y-6">
            <h2 className="text-2xl font-semibold">Related resources</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <Link
                  className="rounded-lg border p-4 hover:border-primary"
                  href={routes.article(lang, resource.slug)}
                  key={resource.slug}
                >
                  <h3 className="font-semibold">{resource.title}</h3>
                  {resource.excerpt ? <p className="mt-2 text-muted-foreground">{resource.excerpt}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

    </article>
  );
}
