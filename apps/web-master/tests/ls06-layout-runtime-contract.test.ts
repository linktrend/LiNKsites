import assert from "node:assert/strict";
import test from "node:test";

import {
  bindLayoutRuntimeAdapter,
  LAYOUT_RUNTIME_ADAPTER_SCHEMA,
} from "../src/components/page-renderer/layout-runtime-adapter.ts";
import { resolveResponsiveLayout } from "../src/components/page-renderer/responsive-layout.ts";
import {
  createFakeLs05LayoutAdapter,
  FAKE_LS05_HOLD_INPUTS,
} from "./support/fake-ls05-layout-adapter.ts";

test("LS-06 injected fake LS-05 adapter is deterministic and binds an A1/B runtime", () => {
  const first = bindLayoutRuntimeAdapter(createFakeLs05LayoutAdapter());
  const second = bindLayoutRuntimeAdapter(createFakeLs05LayoutAdapter());
  assert.deepEqual(first, second);
  assert.equal(first.runtime.layoutPackId, "A1");
  assert.equal(first.runtime.planId, "B");
  assert.deepEqual(FAKE_LS05_HOLD_INPUTS, {
    exactLs05AdapterReceipt: "HOLD",
    exactA1MaterializationReceipt: "HOLD",
    liveProviderReadback: "HOLD",
  });
});

test("LS-06 adapter injection fails closed for schema and exact provider identity mismatches", () => {
  assert.throws(
    () => bindLayoutRuntimeAdapter(createFakeLs05LayoutAdapter((packet) => ({ ...packet, schemaVersion: "unknown" as typeof LAYOUT_RUNTIME_ADAPTER_SCHEMA }))),
    /unsupported layout runtime adapter schema/,
  );
  assert.throws(
    () => bindLayoutRuntimeAdapter(createFakeLs05LayoutAdapter((packet) => ({
      ...packet,
      provider: { ...(packet.provider as object), providerId: "wrong-provider" },
    }))),
    /provider id does not match the A1 pin/,
  );
});

test("LS-06 A2 responsive contract hides the aside below the wide breakpoint", () => {
  assert.deepEqual(resolveResponsiveLayout({ layoutPackId: "A2", viewportWidth: 390 }), {
    layoutPackId: "A2", mode: "compact", asideVisible: false, columns: 1,
  });
  assert.deepEqual(resolveResponsiveLayout({ layoutPackId: "A2", viewportWidth: 1024 }), {
    layoutPackId: "A2", mode: "wide", asideVisible: true, columns: 2,
  });
  assert.equal(resolveResponsiveLayout({ layoutPackId: "A1", viewportWidth: 1440 }).columns, 1);
  assert.equal(resolveResponsiveLayout({ layoutPackId: "A3", viewportWidth: 1440 }).asideVisible, false);
});

test("LS-06 responsive runtime rejects invalid and pathological viewport inputs", () => {
  for (const viewportWidth of [0, -1, 390.5, Number.NaN, Number.POSITIVE_INFINITY, 16_385]) {
    assert.throws(() => resolveResponsiveLayout({ layoutPackId: "A2", viewportWidth }), /fail closed/);
  }
});
