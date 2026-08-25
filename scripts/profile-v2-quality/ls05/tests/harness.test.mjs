#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createGenerationIdentity,
  createInjectedAdapter,
  createValidIdentity,
} from "../fixtures/injected-provider.mjs";
import {
  CACHE_ABSENT,
  PARTIAL_INSTALL,
  PATH_TRAVERSAL,
  ROLLBACK_UNAVAILABLE,
  TAMPER_REJECTED,
  materializeExactCache,
  offlineRestart,
  rollbackActiveCache,
} from "../harness.mjs";
import { AdapterError, IDENTITY_ABSENT, requireIdentity } from "../provider-adapter.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

async function withCache(run) {
  const cacheRoot = await mkdtemp(path.join(os.tmpdir(), "ls05-harness-"));
  try {
    return await run(cacheRoot);
  } finally {
    await rm(cacheRoot, { recursive: true, force: true });
  }
}

async function test(name, fn) {
  await fn();
  process.stdout.write(`ok ${name}\n`);
}

await test("requireIdentity fails closed when identity is absent", async () => {
  for (const value of [null, undefined, {}, { repository: "x" }, { ...createValidIdentity(), tree: "" }]) {
    assert.throws(() => requireIdentity(value), (error) => error instanceof AdapterError && error.code === IDENTITY_ABSENT);
  }
});

await test("materialize fails closed when adapter discover returns no identity", async () => {
  await withCache(async (cacheRoot) => {
    const adapter = createInjectedAdapter({ discoverReturnsNull: true });
    await assert.rejects(
      () => materializeExactCache({ cacheRoot, identity: adapter.identity, adapter }),
      (error) => error instanceof AdapterError && error.code === IDENTITY_ABSENT,
    );
  });
});

await test("materialize writes receipt-bound cache from injected adapter", async () => {
  await withCache(async (cacheRoot) => {
    const adapter = createInjectedAdapter();
    const result = await materializeExactCache({
      cacheRoot,
      identity: adapter.identity,
      adapter,
    });
    const receipt = JSON.parse(await readFile(result.receiptPath, "utf8"));
    assert.equal(receipt.packetComplete, false);
    assert.equal(receipt.immutableA1BytesAsserted, false);
    assert.equal(receipt.preparationOnly, true);
    assert.equal(receipt.identity.tree, adapter.identity.tree);
    const restarted = await offlineRestart({ cacheRoot, identity: adapter.identity });
    assert.equal(restarted.mode, "offline");
  });
});

await test("tamper rejection preserves prior active cache", async () => {
  await withCache(async (cacheRoot) => {
    const first = createInjectedAdapter();
    await materializeExactCache({ cacheRoot, identity: first.identity, adapter: first });
    const tampered = createInjectedAdapter({ tamperDigest: true });
    await assert.rejects(
      () => materializeExactCache({ cacheRoot, identity: tampered.identity, adapter: tampered }),
      (error) => error instanceof AdapterError && error.code === TAMPER_REJECTED,
    );
    const restarted = await offlineRestart({ cacheRoot, identity: first.identity });
    assert.equal(restarted.identity.tree, first.identity.tree);
  });
});

await test("path traversal artifacts are rejected", async () => {
  await withCache(async (cacheRoot) => {
    const adapter = createInjectedAdapter({ unsafePath: true });
    await assert.rejects(
      () => materializeExactCache({ cacheRoot, identity: adapter.identity, adapter }),
      (error) => error instanceof AdapterError && error.code === PATH_TRAVERSAL,
    );
  });
});

await test("partial artifact bundles are rejected", async () => {
  await withCache(async (cacheRoot) => {
    const adapter = createInjectedAdapter({ partial: true });
    await assert.rejects(
      () => materializeExactCache({ cacheRoot, identity: adapter.identity, adapter }),
      (error) => error instanceof AdapterError && (error.code === PARTIAL_INSTALL || error.code === TAMPER_REJECTED),
    );
  });
});

await test("offline restart does not require adapter bytes and fails if cache missing", async () => {
  await withCache(async (cacheRoot) => {
    const identity = createValidIdentity();
    await assert.rejects(
      () => offlineRestart({ cacheRoot, identity }),
      (error) => error instanceof AdapterError && error.code === CACHE_ABSENT,
    );
    const adapter = createInjectedAdapter();
    await materializeExactCache({ cacheRoot, identity: adapter.identity, adapter });
    const restarted = await offlineRestart({ cacheRoot, identity: adapter.identity });
    assert.equal(restarted.mode, "offline");
  });
});

await test("rollback restores previous active identity", async () => {
  await withCache(async (cacheRoot) => {
    const first = createInjectedAdapter();
    await materializeExactCache({ cacheRoot, identity: first.identity, adapter: first });
    const secondFiles = [
      { relativePath: "manifest.json", bytes: Buffer.from('{"generation":2}\n') },
    ];
    const secondIdentity = createGenerationIdentity(secondFiles, {
      tree: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      commit: "ffffffffffffffffffffffffffffffffffffffff",
    });
    const second = createInjectedAdapter({ files: secondFiles, identity: secondIdentity });
    await materializeExactCache({ cacheRoot, identity: second.identity, adapter: second });
    const restored = await rollbackActiveCache({ cacheRoot });
    assert.equal(restored.restored.tree, first.identity.tree);
    const restarted = await offlineRestart({ cacheRoot, identity: first.identity });
    assert.equal(restarted.identity.tree, first.identity.tree);
  });
});

await test("rollback fails closed when no previous pointer exists", async () => {
  await withCache(async (cacheRoot) => {
    await assert.rejects(
      () => rollbackActiveCache({ cacheRoot }),
      (error) => error instanceof AdapterError && error.code === ROLLBACK_UNAVAILABLE,
    );
  });
});

await test("offline restart rejects tampered cached bytes", async () => {
  await withCache(async (cacheRoot) => {
    const adapter = createInjectedAdapter();
    const result = await materializeExactCache({ cacheRoot, identity: adapter.identity, adapter });
    const target = path.join(path.dirname(result.receiptPath), "manifest.json");
    await writeFile(target, "mutated-after-cache\n");
    await assert.rejects(
      () => offlineRestart({ cacheRoot, identity: adapter.identity }),
      (error) => error instanceof AdapterError && error.code === TAMPER_REJECTED,
    );
  });
});

await test("harness modules stay adapter-injected and do not import product or provider trees", async () => {
  const sources = await Promise.all(
    ["harness.mjs", "provider-adapter.mjs", "fixtures/injected-provider.mjs"].map((relative) =>
      readFile(path.join(here, "..", relative), "utf8"),
    ),
  );
  const joined = sources.join("\n");
  assert.doesNotMatch(joined, /from ['"](?:\.\.\/){2,}(?:packages|apps)\//);
  assert.doesNotMatch(joined, /from ['"][^'"]*LiNKlibraries/);
  assert.doesNotMatch(joined, /2\.0\.0-a1\.1/);
});

process.stdout.write("ls05 preparation harness tests passed\n");
