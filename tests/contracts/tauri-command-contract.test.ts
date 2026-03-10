import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      result.push(...walk(full));
    } else {
      result.push(full);
    }
  }
  return result;
}

function frontendInvokedCommands(): Set<string> {
  const files = walk(path.resolve(process.cwd(), "src")).filter((file) =>
    file.endsWith(".ts") || file.endsWith(".tsx"),
  );
  const commands = new Set<string>();
  const regex = /invoke(?:<[^>]+>)?\(\s*["']([^"']+)["']/g;

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      commands.add(match[1]);
    }
  }

  return commands;
}

describe("tauri command contract", () => {
  it("matches frontend invoke usage", () => {
    const contractPath = path.resolve(process.cwd(), "contracts/tauri-commands.json");
    const contract = JSON.parse(readFileSync(contractPath, "utf8")) as { commands: string[] };
    const contractSet = new Set(contract.commands);
    const usedByFrontend = frontendInvokedCommands();

    for (const command of usedByFrontend) {
      expect(contractSet.has(command), `Missing command in contract: ${command}`).toBe(true);
    }
  });
});
