import { evaluateIss1921RuntimeProof } from "../src/components/page-renderer/runtime-proof.ts";

const report = evaluateIss1921RuntimeProof();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.status === "PASS" ? 0 : 1);
