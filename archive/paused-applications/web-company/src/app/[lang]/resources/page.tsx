import { getResourceIndex } from "@/lib/pageService";
import { ResourceIndexLayout } from "@/layouts/ResourceIndexLayout";

type Props = { params: { lang: string } };

export default async function ResourceIndexPage({ params }: Props) {
  const page = await getResourceIndex(params.lang);
  return <ResourceIndexLayout lang={params.lang} page={page} />;
}
