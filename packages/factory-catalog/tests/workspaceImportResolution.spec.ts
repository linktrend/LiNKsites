import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = join(import.meta.dirname, "../../..");
const sourceRoots = ["packages/factory-catalog/src", "packages/program-ledger/src"];

const filesUnder = (root: string): string[] => readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
  const path = join(root, entry.name);
  return entry.isDirectory() ? filesUnder(path) : path.endsWith(".ts") ? [path] : [];
});

describe("workspace import resolution", () => {
  it("keeps relative source imports extensionless for Next/Turbopack", () => {
    const offenders: string[] = [];
    for (const relativeRoot of sourceRoots) {
      for (const file of filesUnder(join(workspaceRoot, relativeRoot))) {
        const source = readFileSync(file, "utf8");
        if (/\b(?:from\s+|import\s*\()(['"])(?:\.\.?\/)[^'"\n]+\.js\1/.test(source)) offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
    expect(existsSync(join(workspaceRoot, "apps/web-master/next.config.mjs"))).toBe(true);
  });
});
