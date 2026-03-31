export function FAQLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <div className="container space-y-6 py-12">
      <header>
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">[FAQ intro]</p>
      </header>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <p className="font-semibold">Question?</p>
          <p className="text-sm text-muted-foreground">Answer placeholder.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="font-semibold">Question?</p>
          <p className="text-sm text-muted-foreground">Answer placeholder.</p>
        </div>
      </div>
    </div>
  );
}
