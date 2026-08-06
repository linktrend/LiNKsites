import { notFound } from "next/navigation";
import { getResourceCategory } from "@/lib/pageService";
import { ResourceCategoryLayout } from "@/layouts/ResourceCategoryLayout";

type Props = { params: { lang: string; categorySlug: string } };

export default async function ResourceCategoryPage({ params }: Props) {
  const page = await getResourceCategory(params.lang, params.categorySlug);
  if (!page) return notFound();
  return <ResourceCategoryLayout lang={params.lang} page={page} />;
}
