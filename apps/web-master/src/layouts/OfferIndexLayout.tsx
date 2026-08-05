import Link from "next/link";
import type { CmsOffer } from "@/lib/repository/offers";
import { routes } from "@/lib/routes";

type Props = { lang: string; page: { data: { offers: CmsOffer[] } } };

/** Render only offer records admitted by the published CMS query. */
export function OfferIndexLayout({ lang, page }: Props) {
  const offers = page.data.offers;

  return (
    <main className="container space-y-8 py-12">
      <h1 className="text-3xl font-bold">Offers</h1>
      {offers.length === 0 ? (
        <p className="text-muted-foreground">Offer content is unavailable.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <Link
              className="rounded-lg border p-6 hover:border-primary"
              href={routes.offer(lang, offer.slug)}
              key={offer.slug}
            >
              <h2 className="text-xl font-semibold">{offer.title}</h2>
              {offer.subtitle ? <p className="mt-2 text-muted-foreground">{offer.subtitle}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
