import { appendFileSync, readFileSync } from "node:fs";

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

const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME ?? "";

if (!tag) {
  console.error("Missing tag input.");
  process.exit(2);
}

const stablePattern = /^v\d+\.\d+\.\d+$/;
const rcPattern = /^v\d+\.\d+\.\d+-rc\.\d+$/;

let channel;
let tagVersion;
if (stablePattern.test(tag)) {
  channel = "stable";
  tagVersion = tag.replace(/^v/, "");
} else if (rcPattern.test(tag)) {
  channel = "rc";
  tagVersion = tag.replace(/^v/, "").replace(/-rc\.\d+$/, "");
} else {
  console.error(`Invalid release tag format: ${tag}`);
  console.error("Expected vX.Y.Z or vX.Y.Z-rc.N");
  process.exit(1);
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

if (pkgVersion !== tagVersion) {
  console.error(`Release tag version mismatch: tag=${tagVersion} manifest=${pkgVersion}`);
  process.exit(1);
}

console.log(`tag=${tag}`);
console.log(`channel=${channel}`);
console.log(`version=${pkgVersion}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tag}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `channel=${channel}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${pkgVersion}\n`);
}
