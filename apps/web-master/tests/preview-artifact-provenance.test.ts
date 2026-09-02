import assert from "node:assert/strict";
import test from "node:test";

import {
  createPreviewArtifactProvenance,
  previewArtifactScope,
  publishPreviewArtifact,
  type PreviewArtifactCache,
  type PreviewArtifactInputs,
  type PreviewArtifactProvenance,
} from "../src/lib/preview-artifact-provenance.ts";

const inputs: PreviewArtifactInputs = {
  siteId: "site-acme",
  locale: "en-AU",
  contentSha256: "a".repeat(64),
  templateTreeSha1: "b".repeat(40),
  rendererSha256: "c".repeat(64),
};

class FakeCache implements PreviewArtifactCache<string> {
  readonly active = new Map<string, PreviewArtifactProvenance>();
  readonly artifacts = new Map<string, string>();
  readonly operations: string[] = [];

  async readActive(scope: string) { return this.active.get(scope); }
  async readArtifact(artifactId: string) { return this.artifacts.get(artifactId); }
  async writeArtifact(artifactId: string, value: string) {
    this.operations.push(`write:${artifactId}`);
    this.artifacts.set(artifactId, value);
  }
  async activate(scope: string, provenance: PreviewArtifactProvenance) {
    this.operations.push(`activate:${provenance.artifactId}`);
    this.active.set(scope, provenance);
  }
  async removeArtifact(artifactId: string) {
    this.operations.push(`remove:${artifactId}`);
    this.artifacts.delete(artifactId);
  }
}

test("preview provenance is deterministic and rejects non-canonical inputs", () => {
  assert.deepEqual(createPreviewArtifactProvenance(inputs), createPreviewArtifactProvenance({ ...inputs }));
  assert.throws(() => createPreviewArtifactProvenance({ ...inputs, siteId: " site-acme" }), /canonical/);
  assert.throws(() => createPreviewArtifactProvenance({ ...inputs, contentSha256: "A".repeat(64) }), /lowercase SHA-256/);
});

test("identical provenance reuses the active artifact without rebuilding", async () => {
  const cache = new FakeCache();
  let builds = 0;
  const first = await publishPreviewArtifact(cache, inputs, async () => `html-${++builds}`);
  const replay = await publishPreviewArtifact(cache, inputs, async () => `html-${++builds}`);

  assert.equal(first.cacheHit, false);
  assert.equal(replay.cacheHit, true);
  assert.equal(builds, 1);
  assert.equal(cache.artifacts.get(first.provenance.artifactId), "html-1");
});

test("changed build inputs activate new bytes before invalidating stale bytes", async () => {
  const cache = new FakeCache();
  const first = await publishPreviewArtifact(cache, inputs, async () => "old-html");
  cache.operations.length = 0;

  const nextInputs = { ...inputs, rendererSha256: "d".repeat(64) };
  const next = await publishPreviewArtifact(cache, nextInputs, async () => "new-html");

  assert.equal(next.invalidatedArtifactId, first.provenance.artifactId);
  assert.deepEqual(cache.operations.map((operation) => operation.split(":")[0]), ["write", "activate", "remove"]);
  assert.equal(cache.artifacts.has(first.provenance.artifactId), false);
  assert.equal(cache.artifacts.get(next.provenance.artifactId), "new-html");
  assert.equal(cache.active.get(previewArtifactScope(nextInputs))?.artifactId, next.provenance.artifactId);
});

test("failed builds preserve the previously active artifact", async () => {
  const cache = new FakeCache();
  const first = await publishPreviewArtifact(cache, inputs, async () => "old-html");

  await assert.rejects(
    publishPreviewArtifact(cache, { ...inputs, contentSha256: "e".repeat(64) }, async () => {
      throw new Error("HOLD: local builder unavailable");
    }),
    /HOLD/,
  );
  assert.equal(cache.active.get(previewArtifactScope(inputs))?.artifactId, first.provenance.artifactId);
  assert.equal(cache.artifacts.get(first.provenance.artifactId), "old-html");
});
