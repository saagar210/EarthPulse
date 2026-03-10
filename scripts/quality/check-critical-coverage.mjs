import { readFileSync } from "node:fs";

const summaryPath = "coverage/coverage-summary.json";
const summary = JSON.parse(readFileSync(summaryPath, "utf8"));

const criticalFloors = {
  "src/stores/settingsStore.ts": { lines: 85, branches: 20, functions: 5 },
  "src/stores/sourceHealthStore.ts": { lines: 85, branches: 60, functions: 80 },
  "src/hooks/useSourceHealth.ts": { lines: 85, branches: 80, functions: 80 },
  "src/components/Sidebar/SourceHealthPanel.tsx": { lines: 70, branches: 45, functions: 80 },
};

const failures = [];

for (const [file, floor] of Object.entries(criticalFloors)) {
  const summaryKey = Object.keys(summary).find((key) => key.endsWith(file));
  const entry = summaryKey ? summary[summaryKey] : null;
  if (!entry) {
    failures.push(`${file}: missing in coverage summary`);
    continue;
  }

  for (const [metric, min] of Object.entries(floor)) {
    const value = entry[metric]?.pct ?? 0;
    if (value < min) {
      failures.push(`${file}: ${metric} ${value}% < required ${min}%`);
    }
  }
}

if (failures.length > 0) {
  console.error("Critical coverage gate failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Critical coverage gate passed.");
