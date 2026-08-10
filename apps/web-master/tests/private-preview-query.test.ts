import assert from "node:assert/strict";
import test from "node:test";

import { siteLocaleFilter } from "../src/lib/repository/shared-filters";

test("private preview queries select drafts without broadening tenant or locale scope", () => {
  assert.deepEqual(siteLocaleFilter("preview-site", "en", "draft"), {
    and: [
      { site: { equals: "preview-site" } },
      { locale: { equals: "en" } },
      { status: { equals: "draft" } },
    ],
  });
  assert.deepEqual(siteLocaleFilter("preview-site", "en"), {
    and: [
      { site: { equals: "preview-site" } },
      { locale: { equals: "en" } },
      { status: { equals: "published" } },
    ],
  });
});
