import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

type CapacityFixture = {
  kind: string;
  synthetic: boolean;
  source: string;
  fixtureIdentity: string;
  liveIdentities: Record<string, string>;
  forbiddenFixedLimits: string[];
  runtimeSources: string[];
};

const here = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(here, "../../..");
const fixturePath = resolve(here, "fixtures/technical-prd-capacity-boundary.synthetic.json");
const prdPath = resolve(repositoryRoot, "docs/LINKSITES-TECHNICAL-PRD.md");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as CapacityFixture;

test("canonical PRD capacity boundary stays bound to synthetic HOLD evidence", () => {
  assert.equal(fixture.kind, "technical-prd-capacity-boundary");
  assert.equal(fixture.synthetic, true);
  assert.match(fixture.fixtureIdentity, /^HOLD-/);
  assert.deepEqual(fixture.liveIdentities, {
    telemetry: "HOLD",
    loadTest: "HOLD",
    stage: "HOLD",
    production: "HOLD",
  });

  const prd = readFileSync(prdPath, "utf8");
  assert.match(prd, /Capacity thresholds are \*\*measured\*\*, not a fixed "20 sites per VPS" rule/);
  assert.match(prd, /regional placement planner \(M15–M18 largely scaffolding \+ doctrine\)/);
});

test("runtime sources do not promote the planning estimate into a fixed capacity limit", () => {
  for (const source of fixture.runtimeSources) {
    const contents = readFileSync(resolve(repositoryRoot, source), "utf8").toLowerCase();
    for (const forbiddenLimit of fixture.forbiddenFixedLimits) {
      assert.equal(
        contents.includes(forbiddenLimit.toLowerCase()),
        false,
        `${source} must not encode the planning estimate ${JSON.stringify(forbiddenLimit)}`,
      );
    }
  }
});
