import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo";
import { SITE_CONFIG, getAiActions, getSiteUrl } from "@/config";
import { assertJsonLdMatchesVisibleFacts, collectVisibleFacts } from "@/lib/seo/visible-facts";

export function SiteStructuredData() {
  const actions = getAiActions().actions.map((action) => ({
    name: action.name,
    url: action.url,
    method: action.method,
    description: action.description,
  }));

  const facts = collectVisibleFacts({
    name: SITE_CONFIG.siteName,
    url: getSiteUrl(),
    description: SITE_CONFIG.description,
  });
  const schemas = [buildOrganizationJsonLd(), buildWebSiteJsonLd(actions)];
  for (const schema of schemas) {
    assertJsonLdMatchesVisibleFacts(schema, facts, ["name", "url", "description"]);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
