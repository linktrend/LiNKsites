export function ArticleLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <article className="container space-y-8 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Article</p>
        <h1 className="text-4xl font-bold">[Article Title]</h1>
        <p className="text-lg text-muted-foreground">[Article Excerpt]</p>
        <p className="text-sm text-muted-foreground">Published: [Date]</p>
      </header>
      <div className="aspect-[16/9] bg-muted rounded-lg" />
      <section className="prose max-w-3xl">[Body rich text placeholder]</section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Related articles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Related article</div>
          <div className="p-4 border rounded-lg">Related article</div>
          <div className="p-4 border rounded-lg">Related article</div>
        </div>
      </section>
    </article>
  );
}
