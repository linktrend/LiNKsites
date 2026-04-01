import Link from "next/link";
import { resolveImage } from "../lib/resolveImage";
import { CmsOffer } from "@/lib/repository/offers";
import { CmsArticle as CmsResource } from "@/lib/repository/articles";
import { buildArticleJsonLd } from "@/lib/seo";
import { routes } from "@/lib/routes";

type Props = { lang: string; page: { data: { article?: CmsResource; related: CmsResource[]; offer?: CmsOffer } } };

export function ArticleLayout({ lang, page }: Props) {
  const article = page.data.article;
  const related = page.data.related;
  const offer = page.data.offer;
  if (!article) return <div className="container py-12">Article not found.</div>;
  const body =
    typeof article.body === "string"
      ? article.body
      : article.body
        ? JSON.stringify(article.body, null, 2)
        : "";
  const imageUrl = resolveImage(article.image ?? undefined);
  const reviewedBy =
    typeof (article as any).reviewedBy === "string"
      ? (article as any).reviewedBy
      : (article as any).reviewedBy?.name;
  const schema = buildArticleJsonLd({
    title: article.title,
    description: article.excerpt ?? "",
    url: `/${lang}/resources/articles/${article.slug}`,
    image: imageUrl ?? "",
    datePublished: article.publishedAt ?? article.date ?? new Date().toISOString(),
    author: reviewedBy ?? "Editorial Team",
    reviewedBy,
    verificationDate: (article as any).reviewedAt ?? undefined,
  });
  return (
    <article className="container space-y-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Article</p>
        <h1 className="text-4xl font-bold">{article.title}</h1>
        <p className="text-lg text-muted-foreground">{article.excerpt}</p>
        <p className="text-sm text-muted-foreground">Published: {article.date}</p>
        {offer && (
          <p className="text-sm">
            Related offer:{" "}
            <Link className="text-primary" href={routes.offer(lang, offer.slug)}>
              {offer.title}
            </Link>
          </p>
        )}
      </header>
      <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={article.title}
        />
      </div>
      <section className="prose max-w-3xl whitespace-pre-wrap">{body}</section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Related articles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((rel) => (
            <Link
              key={rel.slug}
              href={routes.article(lang, rel.slug)}
              className="p-4 border rounded-lg hover:shadow-sm transition"
            >
              <h3 className="font-semibold">{rel.title}</h3>
              <p className="text-sm text-muted-foreground">{rel.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
