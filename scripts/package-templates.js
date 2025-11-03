#!/usr/bin/env node

/**
 * Package Templates Script
 *
 * This script copies template files from tonguetoquill-collection/templates
 * to the static directory for public access.
 *
 * Input: tonguetoquill-collection/templates/*
 * Output: static/templates/*
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEMPLATES_SOURCE_DIR = path.join(PROJECT_ROOT, 'tonguetoquill-collection', 'templates');
const TEMPLATES_OUTPUT_DIR = path.join(PROJECT_ROOT, 'static', 'templates');

/**
 * Copy a file
 */
async function copyFile(sourcePath, destPath) {
	await fs.copyFile(sourcePath, destPath);
	const stats = await fs.stat(destPath);
	console.log(`  ✓ Copied ${path.basename(destPath)} (${stats.size} bytes)`);
}

/**
 * Main packaging function
 */
async function packageTemplates() {
	console.log('📦 Packaging Templates...\n');

	try {
		// Ensure output directory exists
		await fs.mkdir(TEMPLATES_OUTPUT_DIR, { recursive: true });
		console.log(`Created output directory: ${TEMPLATES_OUTPUT_DIR}\n`);

		// Read all files in templates source
		const entries = await fs.readdir(TEMPLATES_SOURCE_DIR, { withFileTypes: true });
		const templateFiles = entries.filter((entry) => entry.isFile());

		if (templateFiles.length === 0) {
			console.warn('⚠️  No template files found in', TEMPLATES_SOURCE_DIR);
			return;
		}

		let copiedCount = 0;

		// Copy each template file
		for (const file of templateFiles) {
			const fileName = file.name;
			const sourcePath = path.join(TEMPLATES_SOURCE_DIR, fileName);
			const destPath = path.join(TEMPLATES_OUTPUT_DIR, fileName);

			console.log(`Processing: ${fileName}`);
			await copyFile(sourcePath, destPath);
			copiedCount++;
		}

		console.log(`\n✅ Template packaging complete!\n`);
		console.log(`Output directory: ${TEMPLATES_OUTPUT_DIR}`);
		console.log(`Files copied: ${copiedCount}`);
	} catch (error) {
		console.error('\n❌ Error packaging templates:', error.message);
		process.exit(1);
	}
}

// Run the script
packageTemplates();
