/**
 * Spawn the exact-candidate generator with Node type-stripping.
 * Plain `node --test` cannot import factory-catalog TypeScript.
 */
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const GENERATE_CONSUMER_PROOF = resolve(
  here,
  "../../../scripts/profile-v2-quality/ext-ls-01/generate-consumer-proof.mjs",
);

export function runExactCandidateConsumerProof(args = [], options = {}) {
  const repoRoot = options.repoRoot ?? resolve(here, "../../..");
  const stdout = execFileSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", GENERATE_CONSUMER_PROOF, ...args],
    {
      encoding: "utf8",
      cwd: repoRoot,
      env: {
        ...process.env,
        LINKLIBRARIES_ROOT: process.env.LINKLIBRARIES_ROOT || "/agent/repos/LiNKlibraries",
      },
    },
  );
  return JSON.parse(stdout);
}
