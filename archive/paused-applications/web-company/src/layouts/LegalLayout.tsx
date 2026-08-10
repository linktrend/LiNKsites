export function LegalLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <article className="container space-y-6 py-12">
      <header>
        <h1 className="text-3xl font-bold">[Legal Title]</h1>
      </header>
      <section className="prose max-w-3xl">[Legal content placeholder]</section>
    </article>
  );
}
