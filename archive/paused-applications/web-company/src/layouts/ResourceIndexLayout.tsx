export function ResourceIndexLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <div className="container space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Resources</h1>
        <p className="text-lg text-muted-foreground">[Resource intro]</p>
      </header>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-2 rounded-full border">Category</span>
          <span className="px-3 py-2 rounded-full border">Category</span>
          <span className="px-3 py-2 rounded-full border">Category</span>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Latest articles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Article</div>
          <div className="p-4 border rounded-lg">Article</div>
          <div className="p-4 border rounded-lg">Article</div>
        </div>
      </section>
    </div>
  );
}
