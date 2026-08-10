import { CTA } from "../components/common/CTA";

export function OfferIndexLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <div className="space-y-8">
      <section className="container py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">[Hero Title]</h1>
          <p className="text-lg text-muted-foreground">[Hero Subtitle]</p>
          <CTA href="/contact" label="[CTA]" />
        </div>
      </section>
      <section className="container py-12 border-t">
        <h2 className="text-2xl font-semibold mb-4">Offers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Offer card placeholder</div>
          <div className="p-4 border rounded-lg">Offer card placeholder</div>
          <div className="p-4 border rounded-lg">Offer card placeholder</div>
        </div>
      </section>
      <section className="container py-12 border-t">
        <h2 className="text-2xl font-semibold mb-4">Latest resources</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Article card</div>
          <div className="p-4 border rounded-lg">Article card</div>
          <div className="p-4 border rounded-lg">Article card</div>
        </div>
      </section>
    </div>
  );
}
