export function ResourceCategoryLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <div className="container space-y-6 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Category</p>
        <h1 className="text-3xl font-bold">[Category Title]</h1>
        <p className="text-lg text-muted-foreground">[Category description]</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">Article</div>
        <div className="p-4 border rounded-lg">Article</div>
        <div className="p-4 border rounded-lg">Article</div>
      </div>
    </div>
  );
}
