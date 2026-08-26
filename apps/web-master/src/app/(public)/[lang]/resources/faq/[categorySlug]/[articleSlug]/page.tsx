import { notFound } from "next/navigation";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";

type Props = { params: Promise<{ lang: string; categorySlug: string; articleSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, categorySlug, articleSlug } = await params;
  try {
    await requirePublicFamilyPage({
      lang,
      pathname: `/${lang}/resources/faq/${categorySlug}/${articleSlug}`,
    });
  } catch {
    return { title: "FAQ unavailable", robots: { index: false, follow: false } };
  }
  return { title: "FAQ unavailable", robots: { index: false, follow: false } };
}

export default async function FaqArticlePage({ params }: Props) {
  const { lang, categorySlug, articleSlug } = await params;
  await requirePublicFamilyPage({
    lang,
    pathname: `/${lang}/resources/faq/${categorySlug}/${articleSlug}`,
  });
  return notFound();
}
