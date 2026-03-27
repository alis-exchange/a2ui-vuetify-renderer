import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const catalogDir = path.join(rootDir, 'catalog');
const catalogPath = path.join(catalogDir, 'vuetify-catalog.json');
const scriptPath = path.join(__dirname, 'generate-catalog.mjs');

describe('generate-catalog.mjs', () => {
    beforeAll(() => {
        // Ensure catalog directory exists
        if (!fs.existsSync(catalogDir)) {
            fs.mkdirSync(catalogDir, { recursive: true });
        }
        // Removing fs.unlinkSync(catalogPath) to avoid race conditions with other tests importing this JSON
    });

    afterAll(() => {
        // Optional: clean up after tests, but maybe we want to inspect it during dev
        // if (fs.existsSync(catalogPath)) {
        //    fs.unlinkSync(catalogPath);
        // }
    });

    it('should generate vuetify-catalog.json containing $defs', () => {
        execSync(`node ${scriptPath}`, { cwd: rootDir, stdio: 'inherit' });

        expect(fs.existsSync(catalogPath)).toBe(true);

        const content = fs.readFileSync(catalogPath, 'utf-8');
        const json = JSON.parse(content);

        expect(json).toBeDefined();
        expect(json.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
        expect(json.$id).toBe("https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json");
        expect(json.$defs).toBeDefined();
        
        // Basic check for required $defs
        const defsKeys = Object.keys(json.$defs);
        expect(defsKeys).toContain('ComponentCommon');
        expect(defsKeys).toContain('CatalogComponentCommon');
        expect(defsKeys).toContain('DynamicString');

        // Check if we have schemas defined, not just empty objects
        const componentsKeys = Object.keys(json.components);
        expect(componentsKeys.length).toBeGreaterThan(0);
        
        for (const key of componentsKeys) {
            const schema = json.components[key];
            expect(schema.type).toBe('object');
            expect(schema.allOf).toBeDefined();
            expect(schema.allOf.length).toBeGreaterThan(0);
        }

        // Check for required functions
        const functionsKeys = Object.keys(json.functions);
        const requiredFunctions = [
            'required', 'regex', 'length', 'numeric', 'email', 'formatString',
            'formatNumber', 'formatCurrency', 'formatDate', 'pluralize',
            'openUrl', 'and', 'or', 'not'
        ];
        for (const fn of requiredFunctions) {
            expect(functionsKeys).toContain(fn);
            const fnSchema = json.functions[fn];
            expect(fnSchema.type).toBe('object');
            expect(fnSchema.properties).toBeDefined();
            expect(fnSchema.properties.call).toBeDefined();
        }
    });

    it('should fail if components in defaultCatalog.ts do not match catalog components', () => {
        expect(() => {
            execSync(`node ${scriptPath} --test-fail`, { cwd: rootDir, stdio: 'pipe' });
        }).toThrow();
    });

    it('should be runnable via npm run generate:catalog', () => {
        // Just run it to ensure the npm script is configured correctly
        execSync('npm run generate:catalog', { cwd: rootDir, stdio: 'inherit' });
        expect(fs.existsSync(catalogPath)).toBe(true);
    });
});
