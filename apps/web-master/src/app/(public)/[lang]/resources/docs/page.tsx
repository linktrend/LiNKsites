import { notFound } from "next/navigation";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/docs` });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
  return { title: "Page unavailable", robots: { index: false, follow: false } };
}

export default async function DocsPage({ params }: Props) {
  const { lang } = await params;
  await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/docs` });
  return notFound();
}
