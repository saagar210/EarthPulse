import { readFileSync } from "node:fs";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readCargoVersion(path) {
  const text = readFileSync(path, "utf8");
  const pkgSection = text.split(/\n\[/).find((section) => section.startsWith("[package]"));
  if (!pkgSection) return null;
  const match = pkgSection.match(/\nversion\s*=\s*"([^"]+)"/);
  return match?.[1] ?? null;
}

const pkgVersion = readJson("package.json").version;
const tauriVersion = readJson("src-tauri/tauri.conf.json").version;
const cargoVersion = readCargoVersion("src-tauri/Cargo.toml");

const versions = {
  package_json: pkgVersion,
  tauri_conf: tauriVersion,
  cargo_toml: cargoVersion,
};

const unique = new Set(Object.values(versions));

if (unique.size !== 1) {
  console.error("Version mismatch detected across release sources:");
  console.error(JSON.stringify(versions, null, 2));
  process.exit(1);
}

console.log(`Version sync OK: ${pkgVersion}`);
