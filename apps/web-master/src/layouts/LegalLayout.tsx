import { CmsLegal } from "@/lib/repository/legal";

type Props = { lang: string; page: { data: { legal?: CmsLegal } } };

export function LegalLayout({ lang, page }: Props) {
  const legal = page.data.legal;
  if (!legal) return <div className="container py-12">Legal page not found.</div>;
  const body =
    typeof legal.body === "string"
      ? legal.body
      : legal.body
        ? JSON.stringify(legal.body, null, 2)
        : "Content unavailable.";
  return (
    <article className="container space-y-6 py-12">
      <header>
        <h1 className="text-3xl font-bold">{legal.title}</h1>
      </header>
      <section className="prose max-w-3xl whitespace-pre-wrap">{body}</section>
    </article>
  );
}
