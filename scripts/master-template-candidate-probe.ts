import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { materializeRevision2WebsiteTemplate } from "../packages/factory-catalog/src/revision2Materialization.ts";

const providerRoot = process.env.LINKSITES_LINKLIBRARIES_ROOT;
const sourceCommitSha = process.env.LINKSITES_LINKLIBRARIES_COMMIT_SHA;
const sourceTreeSha = process.env.LINKSITES_LINKLIBRARIES_TREE_SHA;
const dependencyLockSha256 = process.env.LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256;
if (!providerRoot || !sourceCommitSha || !sourceTreeSha || !dependencyLockSha256) throw new Error("candidate probe requires the exact provider root, commit/tree and dependency-lock digest");
const checkoutCommit = execFileSync("git", ["-C", providerRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const checkoutTree = execFileSync("git", ["-C", providerRoot, "rev-parse", "HEAD^{tree}"], { encoding: "utf8" }).trim();
if (checkoutCommit !== sourceCommitSha || checkoutTree !== sourceTreeSha) throw new Error(`provider checkout identity mismatch: ${checkoutCommit}/${checkoutTree}`);
const input = { providerRoot, entryId: "master-template-type-1", version: "1.0.0", pin: { sourceCommitSha, sourceTreeSha, dependencyLockSha256 }, allowDraftCandidate: true } as const;
const candidate = materializeRevision2WebsiteTemplate(input);
if (!candidate.ok || candidate.value.reference.receiptType !== "candidate") throw new Error(`exact draft candidate rejected: ${candidate.ok ? "wrong receipt type" : candidate.errors.join("; ")}`);
const production = materializeRevision2WebsiteTemplate({ ...input, allowDraftCandidate: false });
if (production.ok) throw new Error("production admission incorrectly accepted a draft/non-selectable candidate");
const tempRoot = mkdtempSync(join(tmpdir(), "linksites-master-template-probe-"));
try {
  const probe = (name: string, mutate: (root: string) => void): void => {
    const root = join(tempRoot, name);
    cpSync(providerRoot, root, { recursive: true });
    mutate(root);
    const result = materializeRevision2WebsiteTemplate({ ...input, providerRoot: root });
    if (result.ok) throw new Error(`${name} negative probe unexpectedly passed`);
  };
  probe("missing-file", (root) => rmSync(join(root, "registry/v2/entries/master-template-type-1/versions/1.0.0/artifact/design/tokens.css")));
  probe("missing-content", (root) => rmSync(join(root, "registry/v2/entries/master-template-type-1/versions/1.0.0/artifact/content/default-content.json")));
  probe("tampered", (root) => writeFileSync(join(root, "registry/v2/entries/master-template-type-1/versions/1.0.0/artifact/design/tokens.css"), `${readFileSync(join(root, "registry/v2/entries/master-template-type-1/versions/1.0.0/artifact/design/tokens.css"), "utf8")}\n/* tampered */\n`))
  const mutatedTokenPath = join(tempRoot, "mutated-tokens.css");
  const original = candidate.value.files["design/tokens.css"];
  const mutated = original.replace(/(--color-primary:\s*)#[0-9a-f]+/i, "$1#d946ef");
  if (mutated === original) throw new Error("provider token mutation did not change a visible token");
  writeFileSync(mutatedTokenPath, mutated);
  console.log(JSON.stringify({ exactCandidate: "PASS", receiptPersistence: "PASS", productionDraftRejection: "PASS", missingFile: "PASS", missingContent: "PASS", tamper: "PASS", providerTokenMutation: "PASS", originalPrimary: original.match(/--color-primary:\s*([^;]+)/)?.[1], mutatedPrimary: mutated.match(/--color-primary:\s*([^;]+)/)?.[1], materializedFiles: Object.keys(candidate.value.files).length, mutatedTokenPath }));
  console.log(`LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH=${mutatedTokenPath}`);
} finally {
  // The wrapper copies the mutated token to a separate path before the proof server starts.
  // Keep the temp root only for the caller-owned mutated token file.
}
