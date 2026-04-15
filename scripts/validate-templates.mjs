#!/usr/bin/env node

/**
 * Validates that every template in the collection compiles correctly.
 *
 * For each template defined in templates/templates.json:
 *   1. Parse the markdown to extract the QUILL reference
 *   2. Require major.minor (or finer) on that reference — not major-only
 *   3. Register the required quill with the engine
 *   4. Render the template to validate it compiles
 *
 * Templates marked as `production: false` are validated but do not cause
 * test failures if they fail to compile.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileSystemSource, QuillRegistry } from '@quillmark/registry';
import { Quillmark, init } from '@quillmark/wasm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(repoRoot, 'templates');
const quillsDir = path.join(repoRoot, 'quills');

/**
 * True if the quill reference pins at least major.minor (e.g. name@0.2 or name@0.2.1).
 * Bare major-only (name@1) is rejected.
 *
 * @param {string} ref - Full quill reference like "usaf_memo@0.2"
 */
function quillRefHasAtLeastMinorVersion(ref) {
  const at = ref.indexOf('@');
  if (at === -1) return false;
  const version = ref.slice(at + 1).trim();
  if (!version) return false;
  const core = version.split(/[-+]/)[0];
  const segments = core.split('.').filter((s) => s.length > 0);
  return segments.length >= 2;
}

/**
 * Normalizes a quill reference to use full semver.
 * Templates often use short versions like "quill@0.2" but the
 * filesystem has directories like "0.2.0".
 * 
 * @param {string} ref - Quill reference like "usaf_memo@0.2"
 * @returns {string} - Normalized reference like "usaf_memo@0.2.0"
 */
function normalizeQuillRef(ref) {
  const [name, version] = ref.split('@');
  if (!version) return ref;
  
  // Count the number of dots to determine version format
  const parts = version.split('.');
  if (parts.length === 2) {
    // Version like "0.2" -> "0.2.0"
    return `${name}@${version}.0`;
  }
  return ref;
}

init();
const engine = new Quillmark();

try {
  const startTime = performance.now();

  // Read templates.json to get list of templates
  const templatesJsonPath = path.join(templatesDir, 'templates.json');
  const templatesConfig = JSON.parse(fs.readFileSync(templatesJsonPath, 'utf-8'));

  // Set up registry for resolving quills
  const source = new FileSystemSource(quillsDir);
  const registry = new QuillRegistry({ source, engine });

  const results = [];

  for (const template of templatesConfig) {
    const entry = {
      name: template.name,
      file: template.file,
      production: template.production !== false,
      parsed: false,
      quillResolved: false,
      rendered: false,
    };

    try {
      // Read template file
      const templatePath = path.join(templatesDir, template.file);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');

      // Parse the markdown to get QUILL reference
      const parsed = Quillmark.parseMarkdown(templateContent);
      entry.parsed = true;

      const quillRef = parsed.quillRef;
      if (!quillRef || quillRef === '__default__') {
        entry.error = 'Template has no QUILL reference';
        results.push(entry);
        continue;
      }

      entry.quillRef = quillRef;

      if (!quillRefHasAtLeastMinorVersion(quillRef)) {
        entry.error =
          'Quill reference must pin at least major.minor (e.g. name@0.2), not major-only or bare name';
        results.push(entry);
        continue;
      }

      // Normalize the quill reference to full semver
      const normalizedRef = normalizeQuillRef(quillRef);

      // Resolve and register the quill
      await registry.resolve(normalizedRef);
      entry.quillResolved = true;

      // Get quill info to find supported formats
      const quillInfo = engine.resolveQuill(normalizedRef);
      if (!quillInfo || !quillInfo.supportedFormats?.length) {
        entry.error = 'Quill has no supported output formats';
        results.push(entry);
        continue;
      }

      // Render the template
      const result = engine.render(parsed, {
        format: quillInfo.supportedFormats[0],
      });

      const firstArtifact = result.artifacts[0];
      if (!firstArtifact || firstArtifact.bytes.length === 0) {
        entry.error = 'Render produced no output artifacts';
      } else {
        entry.rendered = true;
      }
    } catch (err) {
      // Handle error objects that might be thrown from WASM
      if (err instanceof Error) {
        entry.error = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Try to extract message from WASM error objects
        entry.error = err.message || JSON.stringify(err, null, 2);
      } else {
        entry.error = String(err);
      }
    }

    results.push(entry);
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

  for (const entry of results) {
    const icon = entry.error ? '✗' : '✓';
    const productionTag = entry.production ? '' : ' [non-production]';

    if (entry.error) {
      console.log(`  ${icon} ${entry.name} (${entry.file})${productionTag}`);
      console.log(`    parse:   ${entry.parsed ? 'ok' : 'FAILED'}`);
      console.log(`    quill:   ${entry.quillResolved ? 'ok' : 'FAILED'} ${entry.quillRef ? `(${entry.quillRef})` : ''}`);
      console.log(`    render:  ${entry.rendered ? 'ok' : 'FAILED'}`);
      console.error(`    error: ${entry.error}`);
    } else {
      console.log(`  ${icon} ${entry.name} (${entry.file})${productionTag}  (parse: ok, quill: ${entry.quillRef}, render: ok)`);
    }
  }

  // Only count production templates for pass/fail
  const productionResults = results.filter((r) => r.production);
  const nonProductionResults = results.filter((r) => !r.production);

  const productionFailed = productionResults.filter((r) => r.error !== undefined).length;
  const productionPassed = productionResults.length - productionFailed;

  const nonProductionFailed = nonProductionResults.filter((r) => r.error !== undefined).length;
  const nonProductionPassed = nonProductionResults.length - nonProductionFailed;

  console.log();
  console.log(`Production templates: ${productionPassed} passed, ${productionFailed} failed`);
  if (nonProductionResults.length > 0) {
    console.log(`Non-production templates: ${nonProductionPassed} passed, ${nonProductionFailed} failed (not counted in exit status)`);
  }

  console.log();
  if (productionFailed > 0) {
    console.error(`✗ ${productionFailed} of ${productionResults.length} production templates failed validation (${elapsed}s)`);
    process.exit(1);
  } else {
    console.log(`✓ All ${productionPassed} production templates validated successfully (${elapsed}s)`);
  }
} finally {
  engine.free();
}
