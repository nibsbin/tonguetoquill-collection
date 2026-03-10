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
  const startTime = performance.now();

  const { passed, failed, results } = await validateQuills({
    quillsDir,
    engine,
    parseMarkdown: Quillmark.parseMarkdown,
  });

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

  for (const entry of results) {
    const icon = entry.error ? '✗' : '✓';
    const ref = `${entry.name}@${entry.version}`;

    if (entry.error) {
      console.log(`  ${icon} ${ref}`);
      console.log(`    register: ${entry.registered ? 'ok' : 'FAILED'}`);
      console.log(`    render:   ${entry.rendered ? 'ok' : 'FAILED'}`);
      console.error(`    error: ${entry.error}`);
    } else {
      console.log(`  ${icon} ${ref}  (register: ok, render: ok)`);
    }
  }

  console.log();
  if (failed > 0) {
    console.error(`✗ ${failed} of ${results.length} quills failed validation (${elapsed}s)`);
    process.exit(1);
  } else {
    console.log(`✓ All ${passed} quills validated successfully (${elapsed}s)`);
  }
} finally {
  engine.free();
}
