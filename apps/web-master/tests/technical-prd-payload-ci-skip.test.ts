import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

type PayloadCiSkipFixture = {
  kind: string;
  synthetic: boolean;
  source: string;
  prdItem: number;
  fixtureIdentity: string;
  liveIdentities: Record<string, string>;
  requiredSkipEnvNames: string[];
  integrationSpec: string;
  ciSources: string[];
};

const here = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(here, "../../..");
const fixturePath = resolve(here, "fixtures/technical-prd-payload-ci-skip.synthetic.json");
const prdPath = resolve(repositoryRoot, "docs/LINKSITES-TECHNICAL-PRD.md");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as PayloadCiSkipFixture;

test("canonical PRD live-Payload CI skip stays bound to synthetic HOLD evidence", () => {
  assert.equal(fixture.kind, "technical-prd-payload-ci-skip");
  assert.equal(fixture.synthetic, true);
  assert.equal(fixture.prdItem, 10);
  assert.match(fixture.fixtureIdentity, /^HOLD-/);
  assert.deepEqual(fixture.liveIdentities, {
    payload: "HOLD",
    ciHosted: "HOLD",
    stage: "HOLD",
    production: "HOLD",
  });

  const prd = readFileSync(prdPath, "utf8");
  assert.match(
    prd,
    /\*\*Live Payload integration tests in CI\*\* — `PayloadRestDraftTarget` exists; integration suite skips without env credentials \(GAP-50 residual\)\./,
  );
});

test("PayloadRestDraftTarget integration remains skip-gated without live credentials", () => {
  const spec = readFileSync(resolve(repositoryRoot, fixture.integrationSpec), "utf8");

  assert.match(spec, /describe\.skipIf\(!runIntegration\)/);
  assert.match(
    spec,
    /const runIntegration = Boolean\(payloadEndpoint && \(jwtEnv \|\| apiEnv\) && siteEnv\)/,
  );

  for (const envName of fixture.requiredSkipEnvNames) {
    assert.match(spec, new RegExp(`process\\.env\\.${envName}`));
    assert.equal(
      Object.hasOwn(process.env, envName),
      false,
      `${envName} must stay unset in this synthetic HOLD lane`,
    );
  }
});

test("required CI scripts do not inject live Payload integration credentials", () => {
  for (const source of fixture.ciSources) {
    const contents = readFileSync(resolve(repositoryRoot, source), "utf8");
    for (const envName of fixture.requiredSkipEnvNames) {
      assert.equal(
        contents.includes(envName),
        false,
        `${source} must not set ${envName}`,
      );
    }
  }
});
