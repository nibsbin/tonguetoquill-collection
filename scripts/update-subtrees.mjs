#!/usr/bin/env node

/**
 * Updates all subtrees from upstream, targeting the latest version folder
 * for each quill.
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
    let isNew = !existsSync(resolve(repoRoot, prefix));
    let isSubtree = false;

    if (!isNew) {
      try {
        const logOutput = execFileSync(
          "git",
          ["log", `--grep=git-subtree-dir: ${prefix}`, "-1", "--format=%H"],
          { cwd: repoRoot, encoding: "utf-8" }
        );
        isSubtree = logOutput.trim().length > 0;
      } catch (err) {
        // ignore
      }
    }
    
    if (isNew || !isSubtree) {
      if (!isNew) {
        console.log(`Directory exists but is not a subtree. Converting...`);
        // Remove the regular directory and commit the removal so subtree add works
        execFileSync("git", ["rm", "-rf", prefix], { cwd: repoRoot, stdio: "inherit" });
        execFileSync("git", ["commit", "-m", `chore: remove non-subtree ${prefix} prior to subtree add`, "--allow-empty"], { cwd: repoRoot, stdio: "inherit" });
      } else {
        console.log(`Prefix not found, adding as new subtree...`);
      }
      
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
    const action = (!isNew && isSubtree) ? 'updated' : (isNew ? 'added' : 'converted and added');
    console.log(`✓ ${name} subtree ${action} successfully`);
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
