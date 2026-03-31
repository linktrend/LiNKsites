import Link from "next/link";
import { routes } from "@/lib/routes";

type Props = { lang: string };

const RESOURCE_TYPES = [
  { slug: "articles", title: "Articles", description: "Insights and how-tos.", icon: "📰", getHref: (lang: string) => routes.articles(lang) },
  { slug: "videos", title: "Videos", description: "Watch quick demos.", icon: "🎥", getHref: (lang: string) => routes.videos(lang) },
  { slug: "cases", title: "Case Studies", description: "See customer outcomes.", icon: "📊", getHref: (lang: string) => routes.caseStudies(lang) },
  { slug: "faq", title: "FAQ", description: "Answers to common questions.", icon: "❓", getHref: (lang: string) => routes.helpCentre(lang) },
  { slug: "docs", title: "Documents", description: "Guides and PDFs.", icon: "📄", getHref: (lang: string) => routes.resources(lang) }
];

export function ResourceIndexLayout({ lang }: Props) {
  return (
    <div className="container space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Resources</h1>
        <p className="text-lg text-muted-foreground">Explore all formats in one place.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {RESOURCE_TYPES.map((type) => (
          <Link
            key={type.slug}
            href={type.getHref(lang)}
            className="p-5 rounded-lg border bg-white hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{type.icon}</span>
              <h3 className="text-lg font-semibold">{type.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
