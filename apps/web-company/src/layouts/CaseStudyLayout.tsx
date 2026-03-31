export function CaseStudyLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <article className="container space-y-8 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Case Study</p>
        <h1 className="text-4xl font-bold">[Case title]</h1>
        <p className="text-lg text-muted-foreground">[Case summary]</p>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        <div className="p-4 border rounded-lg">Challenge</div>
        <div className="p-4 border rounded-lg">Solution</div>
        <div className="p-4 border rounded-lg">Impact</div>
      </section>
      <section className="prose max-w-3xl">[Full case body]</section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Related offers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Offer</div>
          <div className="p-4 border rounded-lg">Offer</div>
          <div className="p-4 border rounded-lg">Offer</div>
        </div>
      </section>
    </article>
  );
}
