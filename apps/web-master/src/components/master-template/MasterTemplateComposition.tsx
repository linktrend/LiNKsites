import type { StyledMasterTemplatePage, StyledSection } from "@linksites/factory-catalog/master-template-look-and-feel";

type Props = {
  page: StyledMasterTemplatePage;
  css?: string;
  previewSeam?: "unmounted" | "candidate-preview";
};

/**
 * Inspectable marketing-shell composition for mapped master-template pages.
 * Not mounted on the public production renderer. Not the W2-04 marketing-smb-v1 demo.
 */
export function MasterTemplateComposition({ page, css, previewSeam = "unmounted" }: Props) {
  return (
    <article
      className="flex min-h-screen flex-col"
      data-composition={page.composition}
      data-archetype={page.archetypeId}
      data-production-selectable="false"
      data-preview-seam={previewSeam}
    >
      {css ? <style data-theme-contract="theme.json" dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {page.chrome.header ? (
        <header
          className="sticky top-0 z-40 border-b"
          style={{
            background: "color-mix(in srgb, var(--color-background) 95%, transparent)",
            borderColor: "var(--color-border)",
            color: "var(--color-foreground)",
          }}
        >
          <div className="container flex items-center justify-between py-4">
            <p className="text-sm font-semibold tracking-wide">{page.title}</p>
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              Draft inspect
            </p>
          </div>
        </header>
      ) : null}
      <main className="flex-1">
        {page.sections.map((section) => (
          <SectionBand key={section.id} section={section} />
        ))}
      </main>
      {page.chrome.footer ? (
        <footer
          style={{
            background: "var(--gradient-footer)",
            color: "var(--color-primary-foreground)",
            padding: "var(--spacing-xl)",
          }}
        >
          <div className="container text-sm opacity-90">{page.site.route}</div>
        </footer>
      ) : null}
    </article>
  );
}

function SectionBand({ section }: { section: StyledSection }) {
  return (
    <section
      data-library-component={section.libraryComponentId}
      data-react-symbol={section.reactSymbol}
      data-region={section.region}
      style={{
        background: section.surface.background,
        color: section.surface.color,
        padding: section.surface.padding,
      }}
    >
      <div className="container space-y-6">
        {section.copy.eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
            {section.copy.eyebrow}
          </p>
        ) : null}
        {section.copy.heading ? (
          <h2
            className={section.region === "hero" ? "text-4xl font-bold leading-tight" : "text-3xl font-bold"}
            style={{ fontFamily: "var(--font-family-heading)" }}
          >
            {section.copy.heading}
          </h2>
        ) : null}
        {section.copy.body ? (
          <p className="max-w-2xl text-lg leading-relaxed" style={{ opacity: 0.9 }}>
            {section.copy.body}
          </p>
        ) : null}
        {section.copy.items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {section.copy.items.map((item) => (
              <div
                key={item.title}
                className="space-y-2 border p-6"
                style={{
                  background: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                  borderColor: "var(--color-border)",
                  borderRadius: section.surface.radius,
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                {item.description ? (
                  <p className="text-base" style={{ color: "var(--color-muted-foreground)" }}>
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {section.copy.action ? (
          <a
            href={section.copy.action.href}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold"
            style={{
              background: section.region === "cta" ? "var(--color-accent)" : "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {section.copy.action.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}
