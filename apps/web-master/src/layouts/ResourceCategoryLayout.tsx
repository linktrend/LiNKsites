import Link from "next/link";
import { routes } from "@/lib/routes";
import { CmsArticle as CmsResource } from "@/lib/repository/articles";

type Props = { lang: string; page: { data: { category: string; resources: CmsResource[] } } };

export function ResourceCategoryLayout({ lang, page }: Props) {
  const { category, resources } = page.data;
  return (
    <div className="container space-y-6 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Category</p>
        <h1 className="text-3xl font-bold">{category}</h1>
        <p className="text-lg text-muted-foreground">Articles in this category.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {resources.map((article) => (
          <Link
            key={article.slug}
            href={routes.article(lang, article.slug)}
            className="p-4 border rounded-lg hover:shadow-sm transition"
          >
            <h3 className="font-semibold">{article.title}</h3>
            <p className="text-sm text-muted-foreground">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
