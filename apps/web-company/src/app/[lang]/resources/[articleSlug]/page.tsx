import { notFound } from "next/navigation";
import { getResourceArticle } from "@/lib/pageService";
import { ArticleLayout } from "@/layouts/ArticleLayout";

type Props = { params: { lang: string; articleSlug: string } };

export default async function ResourceArticlePage({ params }: Props) {
  const page = await getResourceArticle(params.lang, params.articleSlug);
  if (!page) return notFound();
  return <ArticleLayout lang={params.lang} page={page} />;
}
