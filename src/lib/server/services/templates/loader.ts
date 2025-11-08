/**
 * Server-Side Template Loader
 * Loads template files from the filesystem
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Load a template file from the templates directory
 * @param filename - Template filename (e.g., 'usaf_template.md')
 * @returns Template content as string
 */
export async function loadTemplate(filename: string): Promise<string> {
	const templatePath = join(process.cwd(), 'static', 'templates', filename);
	return await readFile(templatePath, 'utf-8');
}
