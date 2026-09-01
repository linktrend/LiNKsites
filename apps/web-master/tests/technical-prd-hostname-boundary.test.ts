import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

type BoundaryFixture = {
  kind: string;
  synthetic: boolean;
  source: string;
  fixtureIdentity: string;
  liveIdentities: Record<string, string>;
  cases: Array<{ name: string; hostname: string; expectedSiteId: string | null }>;
};

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(here, "fixtures/technical-prd-hostname-boundary.synthetic.json");
const cmsFixturePath = resolve(here, "../data/w2-04-published-fixture.json");
const prdPath = resolve(here, "../../../docs/LINKSITES-TECHNICAL-PRD.md");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as BoundaryFixture;

process.env.NEXT_PUBLIC_CMS_PROVIDER = "fixture";
process.env.CMS_FIXTURE_PATH = cmsFixturePath;

test("canonical PRD hostname boundary stays bound to synthetic HOLD evidence", () => {
  assert.equal(fixture.kind, "technical-prd-hostname-boundary");
  assert.equal(fixture.synthetic, true);
  assert.match(fixture.fixtureIdentity, /^HOLD-/);
  assert.deepEqual(fixture.liveIdentities, {
    payload: "HOLD",
    browser: "HOLD",
    stage: "HOLD",
    production: "HOLD",
  });

  const prd = readFileSync(prdPath, "utf8");
  assert.match(prd, /\*\*Hostname is identity\*\* — unknown hosts fail closed\./);
  assert.match(prd, /Live credentials .* are required for non-mocked operation/);
});

test("synthetic hostname cases prove mapped access and unknown-host rejection", async (t) => {
  const { resolveSiteIdByHostname } = await import("../src/lib/site-context");

  for (const boundaryCase of fixture.cases) {
    await t.test(boundaryCase.name, async () => {
      assert.equal(await resolveSiteIdByHostname(boundaryCase.hostname), boundaryCase.expectedSiteId);
    });
  }
});
