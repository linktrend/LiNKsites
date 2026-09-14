import { CmsAbout } from "@/lib/repository/about";

type Props = { lang: string; page: { data: { about: CmsAbout } } };

export function AboutLayout({ page }: Props) {
  const about = page.data.about;
  const sections = about.sections ?? [];
  const firstBody = sections[0]?.body;
  const more = sections.slice(1).filter((section) => section.title || section.body);
  return (
    <div className="container space-y-10 py-12">
      <header className="space-y-3 text-center">
        {about.heroTitle ? <h1 className="text-4xl font-bold">{about.heroTitle}</h1> : null}
        {about.heroSubtitle ? <p className="text-lg text-muted-foreground">{about.heroSubtitle}</p> : null}
      </header>

      {firstBody ? (
        <section id="company" className="space-y-3">
          <div className="p-5 rounded-lg bg-white border">
            <p className="text-muted-foreground">{firstBody}</p>
          </div>
        </section>
      ) : null}

      {more.length > 0 ? (
        <section id="why-us" className="space-y-3">
          <div className="grid gap-4 md:grid-cols-3">
            {more.map((section: { title?: string; body?: string }, idx: number) => (
              <div key={idx} className="p-4 rounded-lg border bg-white space-y-2">
                {section.title ? <h2 className="font-semibold">{section.title}</h2> : null}
                {section.body ? <p className="text-sm text-muted-foreground">{section.body}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
