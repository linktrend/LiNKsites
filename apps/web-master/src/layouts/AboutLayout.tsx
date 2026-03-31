import { CmsAbout } from "@/lib/repository/about";

type Props = { lang: string; page: { data: { about: CmsAbout } } };

export function AboutLayout({ page }: Props) {
  const about = page.data.about;
  const sections = about.sections ?? [];
  return (
    <div className="container space-y-10 py-12">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-bold">About Us</h1>
        <p className="text-lg text-muted-foreground">{about.heroSubtitle}</p>
      </header>

      <section id="company" className="space-y-3">
        <h2 className="text-2xl font-semibold">Who We Are</h2>
        <div className="p-5 rounded-lg bg-white border">
          <p className="text-muted-foreground">{about.heroTitle}</p>
        </div>
      </section>

      <section id="mission" className="space-y-3">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <div className="p-5 rounded-lg bg-white border">
          <p className="text-muted-foreground">
            {sections[0]?.body ?? "We are committed to delivering AI-first solutions that help teams move faster."}
          </p>
        </div>
      </section>

      <section id="why-us" className="space-y-3">
        <h2 className="text-2xl font-semibold">Why Us</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {sections.slice(1).map((section: any, idx: number) => (
            <div key={idx} className="p-4 rounded-lg border bg-white space-y-2">
              <h3 className="font-semibold">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.body}</p>
            </div>
          ))}
          {sections.slice(1).length === 0 && (
            <div className="p-4 rounded-lg border bg-white text-sm text-muted-foreground">More reasons coming soon.</div>
          )}
        </div>
      </section>
    </div>
  );
}
