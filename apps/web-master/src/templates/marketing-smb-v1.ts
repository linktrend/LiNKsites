import { PageRenderer } from "@/components/page-renderer";
import type { TemplateModule } from "@/templates/types";

/**
 * Wave 1 migration source for the governed LiNKlibraries entry
 * `marketing-smb-v1`. The Factory Catalog owns the selection and immutable
 * consumption receipt; W2-04 must replace this physical source with the
 * accepted LiNKlibraries artifact before production use.
 */
export const marketingSmbV1: TemplateModule = {
  id: "marketing-smb-v1",
  name: "Marketing SMB v1",
  PageRenderer,
};
