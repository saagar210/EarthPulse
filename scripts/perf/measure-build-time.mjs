import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const npmExecPath = process.env.npm_execpath;
if (!npmExecPath) {
  console.error("npm_execpath is not set; run this script through pnpm, npm, or yarn.");
  process.exit(1);
}

const start = Date.now();
const result = spawnSync(process.execPath, [npmExecPath, "run", "build"], {
  stdio: "inherit",
});
const end = Date.now();
const capturedBy = process.env.GITHUB_ACTIONS === "true" ? "ci" : "local";

mkdirSync(".perf-results", { recursive: true });
writeFileSync(
  ".perf-results/build-time.json",
  JSON.stringify(
    {
      buildMs: end - start,
      capturedAt: new Date().toISOString(),
      command: "npm_execpath run build",
      capturedBy,
      runner: process.env.RUNNER_NAME ?? "unknown",
    },
    null,
    2,
  ),
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
