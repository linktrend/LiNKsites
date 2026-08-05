import { buildMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { getPageBySlug } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  try {
    const page = await getPageBySlug({ siteId, locale, slugSegments: ["contact"] });
    if (!page) throw new Error("Contact page missing");

    return buildMetadata(locale, "/contact", {
      title: page.seo?.title || page.title || "Contact Us",
      description:
        page.seo?.description ||
        "Get in touch with our team. We're here to help you succeed.",
      keywords: [
        "contact",
        "get in touch",
        "customer support",
        "sales inquiry",
      ],
    });
  } catch (error) {
    console.error("Error generating contact metadata:", error);
    // Fallback metadata
    return buildMetadata(locale, "/contact", {
      title: "Contact Us",
      description: "Get in touch with our team. We're here to help you succeed.",
    });
  }
}

export default async function ContactPage({ params }: Props) {
  const { lang } = params;
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(lang);

  try {
    const [page, templateId] = await Promise.all([
      getPageBySlug({ siteId, locale, slugSegments: ["contact"] }),
      getTemplateIdForSite({ siteId, locale }),
    ]);
    if (!page) throw new Error("Contact page missing");
    const template = getTemplateModule(templateId);

    return (
      <template.PageRenderer page={page} siteKey={siteId} locale={locale} />
    );
  } catch (error) {
    console.error("Published contact content unavailable:", error);
    return notFound();
  }
}
