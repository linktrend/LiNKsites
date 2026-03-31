import { HelpCentrePageContent } from "@/components/resources/HelpCentrePageContent";
import { buildMetadata } from "@/lib/seo";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/resources/faq", {
    title: "Help Center & FAQ",
    description: "Find answers to frequently asked questions about our platform. Get help with setup, features, billing, and more.",
    keywords: [
      "FAQ",
      "help center",
      "support",
      "frequently asked questions",
      "troubleshooting",
      "documentation",
    ],
  });
}

export default async function FaqPage({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return <HelpCentrePageContent lang={locale} />;
}
