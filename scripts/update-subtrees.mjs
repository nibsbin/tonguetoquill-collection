#!/usr/bin/env node

/**
 * Updates all subtrees from upstream, targeting the latest version folder
 * for each quill.
 *
 * Requires a clean git working tree (no unstaged/staged changes). Commit or
 * stash before running; otherwise `git subtree` fails with "Cannot add".
 *
 * Usage: node scripts/update-subtrees.mjs
 *        npm run update-subtrees
 */

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FileSystemSource } from "@quillmark/registry";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

/** Exits the process if there are any staged or unstaged changes. */
function requireCleanWorkingTree(cwd) {
  const porcelain = execFileSync("git", ["status", "--porcelain"], {
    cwd,
    encoding: "utf-8",
  });
  if (!porcelain.trim()) return;

  console.error(
    "Cannot update subtrees: working tree is not clean.\n" +
      "Commit or stash your changes, then run again.\n\n" +
      "git status --short:\n" +
      porcelain
  );
  process.exit(1);
}

const subtrees = JSON.parse(
  readFileSync(join(repoRoot, "subtrees.json"), "utf-8")
);

const source = new FileSystemSource(join(repoRoot, "quills"));

/** @param {string} a @param {string} b @returns {number} */
function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * Latest X.Y.Z folder for a quill, per FileSystemSource.getManifest().
 * @param {import("@quillmark/registry").QuillManifest} manifest
 * @param {string} name
 */
function resolveLatestVersion(manifest, name) {
  const versions = manifest.quills
    .filter((q) => q.name === name)
    .map((q) => q.version);
  if (versions.length === 0) {
    throw new Error(
      `No versioned quill "${name}" under quills/ (need semver dir with Quill.yaml)`
    );
  }
  versions.sort(compareSemver);
  return versions[versions.length - 1];
}

const manifest = await source.getManifest();
requireCleanWorkingTree(repoRoot);

let failed = false;

for (const [name, config] of Object.entries(subtrees)) {
  const version = resolveLatestVersion(manifest, name);
  const prefix = `quills/${name}/${version}/packages/${config.package}`;

  console.log("=========================================");
  console.log(`Updating subtree: ${name}`);
  console.log(`Version: ${version}`);
  console.log(`Prefix: ${prefix}`);
  console.log(`From: ${config.repo} (${config.branch})`);
  console.log();

  try {
    const prefixAbs = resolve(repoRoot, prefix);
    const isNew = !existsSync(prefixAbs);

    if (isNew) {
      console.log(`Prefix not found, adding as new subtree...`);
      execFileSync(
        "git",
        [
          "subtree",
          "add",
          `--prefix=${prefix}`,
          config.repo,
          config.branch,
          "--squash",
          "-m",
          `chore: add ${name} subtree from upstream`,
        ],
        { cwd: repoRoot, stdio: "inherit" }
      );
    } else {
      execFileSync(
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
    }

    console.log();
    console.log(`✓ ${name} subtree ${isNew ? "added" : "updated"} successfully`);
  } catch (err) {
    console.error();
    const action = (!existsSync(resolve(repoRoot, prefix))) ? 'add' : 'update';
    console.error(`✗ ${name} subtree ${action} failed (exit code ${err.status})`);
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
