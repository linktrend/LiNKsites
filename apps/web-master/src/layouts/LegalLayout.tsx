import { CmsLegal } from "@/lib/repository/legal";

type Props = { page: { data: { legal?: CmsLegal } } };

export function LegalLayout({ page }: Props) {
  const legal = page.data.legal;
  if (!legal) return null;
  const body =
    typeof legal.body === "string"
      ? legal.body
      : null;
  if (!body) return null;
  return (
    <article className="container space-y-6 py-12">
      <header>
        <h1 className="text-3xl font-bold">{legal.title}</h1>
      </header>
      <section className="prose max-w-3xl whitespace-pre-wrap">{body}</section>
    </article>
  );
}
