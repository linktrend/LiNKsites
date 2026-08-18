import { composeMasterTemplateLookAndFeel } from "@linksites/factory-catalog/master-template-look-and-feel";
import { runMasterTemplateCandidatePreview } from "@linksites/factory-catalog/master-template-preview-seam";
import type { CmsPage } from "@/lib/repository/pages";
import { MasterTemplateComposition } from "@/components/master-template/MasterTemplateComposition";

type Props = {
  page: CmsPage;
  siteKey: string;
  locale: string;
  primaryNav?: unknown;
  footerNav?: unknown;
};

/**
 * Proof-only renderer for the pinned Library master. Uses the candidate
 * probe for look-and-feel regions and requires the disposable CMS page to
 * exist with the same Northline slug and title. Not a production admission.
 */
export function MasterTemplateCandidatePreviewRenderer({ page, siteKey, locale }: Props) {
  const preview = runMasterTemplateCandidatePreview({ siteId: siteKey, locale });
  const starter = preview.probe.starterPages.find((candidate) => candidate.slug === page.slug);
  if (!starter) {
    throw new Error(`Candidate preview has no projected page for slug "${page.slug}".`);
  }
  if (starter.title !== page.title) {
    throw new Error(
      `Disposable CMS title "${page.title}" does not match projected Northline title "${starter.title}".`,
    );
  }
  const styled = composeMasterTemplateLookAndFeel({
    ...starter,
    site: {
      ...starter.site,
      siteId: siteKey,
      locale,
      publicationStatus: "draft",
      route: page.slug === "home" ? `/${locale}/demo` : `/${locale}/demo/${page.slug}`,
    },
  });
  return (
    <MasterTemplateComposition
      page={styled}
      previewSeam="candidate-preview"
    />
  );
}
