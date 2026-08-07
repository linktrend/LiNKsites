import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdFromRequest } from "@/lib/site-context";

type Props = { params: { lang: string; categorySlug: string; articleSlug: string } };

export async function generateMetadata({ params }: Props) {
  return { title: "FAQ unavailable", robots: { index: false, follow: false } };
}

export default async function FaqArticlePage() {
  // The current CMS FAQ contract has questions embedded in a published page;
  // it has no article-level slug. Do not substitute the retired mock help
  // corpus for that missing CMS identity.
  await getSiteIdFromRequest();
  return notFound();
}
