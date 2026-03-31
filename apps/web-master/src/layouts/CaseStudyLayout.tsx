import Link from "next/link";
import { CmsCaseStudy as CmsCase } from "@/lib/repository/caseStudies";
import { CmsOffer } from "@/lib/repository/offers";
import { routes } from "@/lib/routes";

type Props = { lang: string; page: { data: { case?: CmsCase; relatedOffers: CmsOffer[] } } };

export function CaseStudyLayout({ lang, page }: Props) {
  const caseStudy = page.data.case;
  const relatedOffers = page.data.relatedOffers;
  if (!caseStudy) return <div className="container py-12">Case not found.</div>;
  return (
    <article className="container space-y-8 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Case Study</p>
        <h1 className="text-4xl font-bold">{caseStudy.title}</h1>
        <p className="text-lg text-muted-foreground">{caseStudy.summary}</p>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <p className="font-semibold mb-2">Challenge</p>
          <p className="text-sm text-muted-foreground">{caseStudy.challenge}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="font-semibold mb-2">Solution</p>
          <p className="text-sm text-muted-foreground">{caseStudy.solution}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="font-semibold mb-2">Impact</p>
          <p className="text-sm text-muted-foreground">{caseStudy.impact}</p>
        </div>
      </section>
      {/* Related Offers Section - Only show if there are related offers */}
      {relatedOffers.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Related offers</h2>
          <div className={`grid gap-4 ${
            relatedOffers.length === 1 ? 'md:grid-cols-1 max-w-md' :
            relatedOffers.length === 2 ? 'md:grid-cols-2' :
            'md:grid-cols-3'
          }`}>
            {relatedOffers.map((offer) => (
              <Link
                key={offer.slug}
                href={routes.offer(lang, offer.slug)}
                className="p-4 border rounded-lg hover:shadow-sm transition"
              >
                <h3 className="font-semibold">{offer.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{offer.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
