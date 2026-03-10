#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const quillsDir = path.join(repoRoot, 'quills');

function walkDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of list) {
    const filePath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

const allFiles = walkDir(quillsDir);
const quillFiles = allFiles.filter(f => f.endsWith('Quill.yaml'));

const seen = new Map();
let hasError = false;

for (const file of quillFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  const nameMatch = content.match(/^[\s]*name:\s*["']?([^"'\n]+?)["']?$/m);
  const versionMatch = content.match(/^[\s]*version:\s*["']?([^"'\n]+?)["']?$/m);
  
  if (!nameMatch || !versionMatch) {
    console.warn(`Warning: Could not extract name or version from ${path.relative(repoRoot, file)}`);
    continue;
  }
  
  const name = nameMatch[1].trim();
  const version = versionMatch[1].trim();
  
  const key = `${name}@${version}`;
  
  if (seen.has(key)) {
    console.error(`Error: Duplicate Quill version found!`);
    console.error(`  1. ${path.relative(repoRoot, seen.get(key))}`);
    console.error(`  2. ${path.relative(repoRoot, file)}`);
    console.error(`  Both declare name '${name}' and version '${version}'.`);
    hasError = true;
  } else {
    seen.set(key, file);
  }
}

if (hasError) {
  console.error('\n✗ Package validation failed.');
  process.exit(1);
} else {
  console.log(`✓ Validated ${quillFiles.length} Quill.yaml files. No duplicates found.`);
}
