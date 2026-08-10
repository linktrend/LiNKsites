import { getDocsPage } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/resources/docs", {
    title: "Documentation",
    description: "Access comprehensive documentation for our platform. Technical guides, API references, and integration documentation.",
    keywords: [
      "documentation",
      "technical docs",
      "API reference",
      "developer guides",
      "integration guides",
    ],
  });
}

export default async function DocsPage({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  await getDocsPage(locale);
  return (
    <div className="container space-y-4 py-12">
      <header className="space-y-2">
        <p className="text-sm uppercase text-muted-foreground">Resources</p>
        <h1 className="text-3xl font-bold">Documents</h1>
      </header>
      <p className="text-muted-foreground">No documents available yet.</p>
    </div>
  );
}
