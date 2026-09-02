import test from "node:test";
import assert from "node:assert/strict";

import { validateW208Packet } from "./w2-08-pre-vps-validator.mjs";

const validPacket = `
**Status:** Candidate pending Luna High verification; VPS authority remains on HOLD
**Executor:** Luna High verifier
Do not deploy, configure the VPS, create DNS records, activate domains, or run the live first-site test.
`;

test("accepts Luna High verification while VPS/live remains on HOLD", () => {
  assert.doesNotThrow(() => validateW208Packet(validPacket));
});

test("rejects the superseded Terra verifier identity", () => {
  assert.throws(() => validateW208Packet(validPacket.replace("Luna High verifier", "Terra verifier")));
});

test("rejects release language that removes the VPS HOLD", () => {
  assert.throws(() => validateW208Packet(validPacket.replace("remains on HOLD", "is authorized")));
});
