import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo";
import { getAiActions } from "@/config";

export function SiteStructuredData() {
  const actions = getAiActions().actions.map((action) => ({
    name: action.name,
    url: action.url,
    method: action.method,
    description: action.description,
  }));

  const schemas = [buildOrganizationJsonLd(), buildWebSiteJsonLd(actions)];

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
