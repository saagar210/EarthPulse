import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertPositive(name, value, path) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} in ${path} must be a finite positive number.`);
  }
}

function writeBaseline(path, payload) {
  mkdirSync(".perf-baselines", { recursive: true });
  writeFileSync(path, JSON.stringify(payload, null, 2) + "\n");
}

const bundleResultPath = ".perf-results/bundle.json";
const buildResultPath = ".perf-results/build-time.json";

const bundle = readJson(bundleResultPath);
const build = readJson(buildResultPath);

assertPositive("totalBytes", bundle.totalBytes, bundleResultPath);
assertPositive("buildMs", build.buildMs, buildResultPath);

writeBaseline(".perf-baselines/bundle.json", {
  totalBytes: bundle.totalBytes,
  capturedAt: bundle.capturedAt ?? new Date().toISOString(),
  capturedBy: bundle.capturedBy ?? "unknown",
});

writeBaseline(".perf-baselines/build-time.json", {
  buildMs: build.buildMs,
  capturedAt: build.capturedAt ?? new Date().toISOString(),
  capturedBy: build.capturedBy ?? "unknown",
});

console.log("Perf baselines updated from current .perf-results metrics.");
