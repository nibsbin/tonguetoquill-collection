#!/usr/bin/env node

/**
 * Validates that every Quill in the collection registers and compiles correctly.
 *
 * Uses @quillmark/registry's validateQuills() to:
 *   1. Register each quill with the WASM engine (validates structure + schema)
 *   2. Render each quill's example document end-to-end (validates compilation)
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateQuills } from '@quillmark/registry';
import { Quillmark, init } from '@quillmark/wasm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quillsDir = path.resolve(__dirname, '..', 'quills');

init();
const engine = new Quillmark();

try {
  const { passed, failed, results } = await validateQuills({
    quillsDir,
    engine,
    parseMarkdown: Quillmark.parseMarkdown,
  });

  for (const entry of results) {
    const status = entry.error ? '✗' : '✓';
    console.log(`  ${status} ${entry.name}@${entry.version}`);
    if (entry.error) {
      console.error(`    ${entry.error}`);
    }
  }

  console.log();
  console.log(`${passed} passed, ${failed} failed out of ${results.length} quills.`);

  if (failed > 0) {
    process.exit(1);
  }
} finally {
  engine.free();
}
