import { readFileSync } from "node:fs";

const [baselinePath, expected = "ci"] = process.argv.slice(2);

if (!baselinePath) {
  console.error("usage: node assert-baseline-provenance.mjs <baseline.json> [expected]");
  process.exit(2);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const capturedBy = baseline.capturedBy ?? "unknown";

if (capturedBy !== expected) {
  console.error(
    `Baseline provenance check failed for ${baselinePath}: expected capturedBy='${expected}', got '${capturedBy}'.`,
  );
  process.exit(1);
}

console.log(`Baseline provenance OK for ${baselinePath}: ${capturedBy}`);
