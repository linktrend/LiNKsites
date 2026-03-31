import { CTA } from "../components/common/CTA";

export function OfferPageLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <article className="container space-y-12 py-12">
      <header className="space-y-4">
        <p className="text-sm uppercase text-muted-foreground">Offer</p>
        <h1 className="text-4xl font-bold">[Offer Title]</h1>
        <p className="text-lg text-muted-foreground">[Offer Subtitle]</p>
        <CTA href="/contact" label="[CTA]" />
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Feature</div>
          <div className="p-4 border rounded-lg">Feature</div>
          <div className="p-4 border rounded-lg">Feature</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Use cases</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Use case</div>
          <div className="p-4 border rounded-lg">Use case</div>
          <div className="p-4 border rounded-lg">Use case</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Tier</div>
          <div className="p-4 border rounded-lg">Tier</div>
          <div className="p-4 border rounded-lg">Tier</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Testimonials</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Testimonial</div>
          <div className="p-4 border rounded-lg">Testimonial</div>
          <div className="p-4 border rounded-lg">Testimonial</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Related resources</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Article</div>
          <div className="p-4 border rounded-lg">Article</div>
          <div className="p-4 border rounded-lg">Article</div>
        </div>
      </section>
    </article>
  );
}
