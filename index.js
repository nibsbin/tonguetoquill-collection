import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const QUILLS_DIR = path.join(__dirname, 'quills');
export const TEMPLATES_DIR = path.join(__dirname, 'templates');
