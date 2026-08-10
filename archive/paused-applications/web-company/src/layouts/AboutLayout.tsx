export function AboutLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <div className="container space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">[About Title]</h1>
        <p className="text-lg text-muted-foreground">[About subtitle]</p>
      </header>
      <section className="space-y-4">
        <div className="p-4 border rounded-lg">Section block</div>
        <div className="p-4 border rounded-lg">Section block</div>
        <div className="p-4 border rounded-lg">Section block</div>
      </section>
    </div>
  );
}
