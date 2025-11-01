#!/usr/bin/env node

/**
 * Package Quills Script
 *
 * This script packages Quill templates from tonguetoquill-collection/quills
 * into zip files and generates a manifest for the web application.
 *
 * Input: tonguetoquill-collection/quills/*
 * Output: static/quills/*.zip + static/quills/manifest.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const QUILLS_SOURCE_DIR = path.join(PROJECT_ROOT, 'tonguetoquill-collection', 'quills');
const QUILLS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'static', 'quills');

/**
 * Parse a Quill.toml file to extract metadata
 */
async function parseQuillToml(tomlPath) {
	try {
		const content = await fs.readFile(tomlPath, 'utf-8');

		// Simple TOML parser for our specific use case
		const metadata = {
			name: '',
			description: '',
			backend: '',
			exampleFile: ''
		};

		// Extract [Quill] section values
		const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
		const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
		const backendMatch = content.match(/backend\s*=\s*"([^"]+)"/);
		const exampleMatch = content.match(/example_file\s*=\s*"([^"]+)"/);

		if (nameMatch) metadata.name = nameMatch[1];
		if (descMatch) metadata.description = descMatch[1];
		if (backendMatch) metadata.backend = backendMatch[1];
		if (exampleMatch) metadata.exampleFile = exampleMatch[1];

		return metadata;
	} catch (error) {
		console.error(`Error parsing ${tomlPath}:`, error.message);
		throw error;
	}
}

/**
 * Zip a directory
 */
async function zipDirectory(sourceDir, outPath) {
	return new Promise((resolve, reject) => {
		const output = createWriteStream(outPath);
		const archive = archiver('zip', {
			zlib: { level: 9 } // Maximum compression
		});

		output.on('close', () => {
			console.log(`  ✓ Created ${path.basename(outPath)} (${archive.pointer()} bytes)`);
			resolve();
		});

		archive.on('error', (err) => {
			reject(err);
		});

		archive.pipe(output);

		// Add all files from source directory
		archive.directory(sourceDir, false);

		archive.finalize();
	});
}

/**
 * Main packaging function
 */
async function packageQuills() {
	console.log('📦 Packaging Quills...\n');

	try {
		// Ensure output directory exists
		await fs.mkdir(QUILLS_OUTPUT_DIR, { recursive: true });
		console.log(`Created output directory: ${QUILLS_OUTPUT_DIR}\n`);

		// Read all directories in quills source
		const entries = await fs.readdir(QUILLS_SOURCE_DIR, { withFileTypes: true });
		const quillDirs = entries.filter((entry) => entry.isDirectory());

		if (quillDirs.length === 0) {
			console.warn('⚠️  No Quill directories found in', QUILLS_SOURCE_DIR);
			return;
		}

		const manifest = {
			quills: []
		};

		// Process each Quill directory
		for (const dir of quillDirs) {
			const quillName = dir.name;
			const quillPath = path.join(QUILLS_SOURCE_DIR, quillName);
			const tomlPath = path.join(quillPath, 'Quill.toml');

			console.log(`Processing: ${quillName}`);

			// Check if Quill.toml exists
			try {
				await fs.access(tomlPath);
			} catch {
				console.warn(`  ⚠️  Skipping ${quillName}: No Quill.toml found`);
				continue;
			}

			// Parse metadata
			const metadata = await parseQuillToml(tomlPath);

			// Validate required fields
			if (!metadata.name || !metadata.backend) {
				console.warn(`  ⚠️  Skipping ${quillName}: Missing required fields in Quill.toml`);
				continue;
			}

			// Create zip file
			const zipPath = path.join(QUILLS_OUTPUT_DIR, `${quillName}.zip`);
			await zipDirectory(quillPath, zipPath);

			// Add to manifest
			manifest.quills.push(metadata);
		}

		// Write manifest
		const manifestPath = path.join(QUILLS_OUTPUT_DIR, 'manifest.json');
		await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
		console.log(`\n✓ Created manifest.json with ${manifest.quills.length} Quill(s)`);

		console.log('\n✅ Quill packaging complete!\n');
		console.log(`Output directory: ${QUILLS_OUTPUT_DIR}`);
		console.log(`Files:`);
		manifest.quills.forEach((q) => console.log(`  - ${q.name}.zip`));
		console.log(`  - manifest.json`);
	} catch (error) {
		console.error('\n❌ Error packaging Quills:', error.message);
		process.exit(1);
	}
}

// Run the script
packageQuills();
