#!/usr/bin/env node

/**
 * Updates all subtrees from upstream, targeting the latest version folder
 * for each quill.
 *
 * Usage: node scripts/update-subtrees.mjs
 *        npm run update-subtrees
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FileSystemSource } from "@quillmark/registry";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const subtrees = JSON.parse(
  readFileSync(join(repoRoot, "subtrees.json"), "utf-8")
);

const source = new FileSystemSource(join(repoRoot, "quills"));

let failed = false;

for (const [name, config] of Object.entries(subtrees)) {
  const version = await source.resolveLatestVersion(name);
  const prefix = `quills/${name}/${version}/packages/${config.package}`;

  console.log("=========================================");
  console.log(`Updating subtree: ${name}`);
  console.log(`Version: ${version}`);
  console.log(`Prefix: ${prefix}`);
  console.log(`From: ${config.repo} (${config.branch})`);
  console.log();

  try {
    const output = execFileSync(
      "git",
      [
        "subtree",
        "pull",
        `--prefix=${prefix}`,
        config.repo,
        config.branch,
        "--squash",
        "-m",
        `chore: update ${name} subtree from upstream`,
      ],
      { cwd: repoRoot, stdio: "inherit" }
    );
    console.log();
    console.log(`✓ ${name} subtree updated successfully`);
  } catch (err) {
    console.error();
    console.error(`✗ ${name} subtree update failed (exit code ${err.status})`);
    failed = true;
  }
  console.log();
}

console.log("=========================================");
if (failed) {
  console.error("✗ Some subtrees failed to update");
  process.exit(1);
} else {
  console.log("✓ All subtrees updated successfully");
}
