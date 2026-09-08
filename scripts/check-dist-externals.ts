/**
 * Fails the build if dist re-bundles @a2ui/web_core. A bundled copy carries its own Preact
 * signals instance, whose effects never track signals from the consumer's web_core, so the
 * renderer would silently stop reacting to data-model changes (see vite.config.ts).
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'a2ui-vuetify-renderer.js');
const source = fs.readFileSync(dist, 'utf-8');
const imports = [...source.matchAll(/from\s*["']([^"']+)["']/g)].map((m) => m[1]);
const problems: string[] = [];

if (!imports.some((id) => id.startsWith('@a2ui/web_core'))) problems.push('dist does not import @a2ui/web_core; it was bundled');
// A string that only exists inside web_core's node layer (our own sources never mention it).
if (source.includes('UNKNOWN_COMPONENT_TYPE')) problems.push('dist contains web_core code ("UNKNOWN_COMPONENT_TYPE")');

if (problems.length > 0) {
  console.error('dist externals check failed:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(`dist externals OK (${[...new Set(imports)].sort().join(', ')})`);
