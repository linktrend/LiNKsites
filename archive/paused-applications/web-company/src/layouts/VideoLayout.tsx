export function VideoLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <article className="container space-y-8 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Video</p>
        <h1 className="text-4xl font-bold">[Video Title]</h1>
        <p className="text-lg text-muted-foreground">[Video description]</p>
      </header>
      <div className="aspect-video bg-muted rounded-lg grid place-items-center">
        <span>[YouTube embed placeholder]</span>
      </div>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Related videos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Video</div>
          <div className="p-4 border rounded-lg">Video</div>
          <div className="p-4 border rounded-lg">Video</div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Related articles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">Article</div>
          <div className="p-4 border rounded-lg">Article</div>
          <div className="p-4 border rounded-lg">Article</div>
        </div>
      </section>
    </article>
  );
}
