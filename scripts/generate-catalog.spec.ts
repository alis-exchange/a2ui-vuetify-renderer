import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const catalogDir = path.join(rootDir, 'catalog');
const catalogPath = path.join(catalogDir, 'vuetify-catalog.json');
const scriptPath = path.join(__dirname, 'generate-catalog.ts');

describe('generate-catalog.ts', () => {
  beforeAll(() => {
    if (!fs.existsSync(catalogDir)) {
      fs.mkdirSync(catalogDir, { recursive: true });
    }
  });

  it('should generate vuetify-catalog.json containing $defs', { timeout: 30_000 }, () => {
    execSync(`npx tsx ${scriptPath}`, { cwd: rootDir, stdio: 'inherit' });

    expect(fs.existsSync(catalogPath)).toBe(true);

    const content = fs.readFileSync(catalogPath, 'utf-8');
    const json = JSON.parse(content);

    expect(json).toBeDefined();
    expect(json.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(json.$id).toBe('https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json');
    expect(json.$defs).toBeDefined();

    const defsKeys = Object.keys(json.$defs);
    expect(defsKeys).toContain('ComponentCommon');
    expect(defsKeys).toContain('CatalogComponentCommon');
    expect(defsKeys).toContain('DynamicString');

    const componentsKeys = Object.keys(json.components);
    expect(componentsKeys.length).toBeGreaterThan(0);

    for (const key of componentsKeys) {
      const schema = json.components[key];
      expect(schema.type).toBe('object');
      expect(schema.allOf).toBeDefined();
      expect(schema.allOf.length).toBeGreaterThan(0);
    }

    const functionsKeys = Object.keys(json.functions);
    const requiredFunctions = ['required', 'regex', 'length', 'numeric', 'email', 'formatString', 'formatNumber', 'formatCurrency', 'formatDate', 'pluralize', 'openUrl', 'and', 'or', 'not'];
    for (const fn of requiredFunctions) {
      expect(functionsKeys).toContain(fn);
      const fnSchema = json.functions[fn];
      expect(fnSchema.type).toBe('object');
      expect(fnSchema.properties).toBeDefined();
      expect(fnSchema.properties.call).toBeDefined();
    }
  });

  it('should fail if components in defaultCatalog.ts do not match catalog components', { timeout: 30_000 }, () => {
    expect(() => {
      execSync(`npx tsx ${scriptPath} --test-fail`, { cwd: rootDir, stdio: 'pipe' });
    }).toThrow();
  });

  it('should be runnable via npm run generate:catalog', { timeout: 30_000 }, () => {
    execSync('npm run generate:catalog', { cwd: rootDir, stdio: 'inherit' });
    expect(fs.existsSync(catalogPath)).toBe(true);
  });
});

/**
 * The catalog document is consumed by agent libraries, not by this renderer (which validates
 * with the Zod schemas directly). These guard the shape those consumers rely on.
 */
describe('the generated catalog document', () => {
  let catalog: any;

  beforeAll(() => {
    execSync(`npx tsx ${scriptPath}`, { cwd: rootDir, stdio: 'inherit' });
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  }, 30_000);

  // An absent allowedCallers means rendererOnly, so without this an agent may invoke nothing.
  it('declares allowedCallers on every function and lets an agent call openUrl', () => {
    const undeclared = Object.entries<any>(catalog.functions)
      .filter(([, def]) => def.allowedCallers === undefined)
      .map(([name]) => name);
    expect(undeclared).toEqual([]);

    const legal = ['rendererOnly', 'agentOnly', 'rendererOrAgent'];
    for (const [name, def] of Object.entries<any>(catalog.functions)) {
      expect(legal, `${name} declares an unknown allowedCallers`).toContain(def.allowedCallers);
    }
    expect(catalog.functions.openUrl.allowedCallers).toBe('rendererOrAgent');
  });

  // callFunction requires catalogId, so a closed function object rejects every well-formed call.
  it('leaves the function object open so a call can carry catalogId, while args stays closed', () => {
    const closed = Object.entries<any>(catalog.functions)
      .filter(([, def]) => def.unevaluatedProperties === false || def.additionalProperties === false)
      .map(([name]) => name);
    expect(closed).toEqual([]);

    const openArgs = Object.entries<any>(catalog.functions)
      .filter(([, def]) => def.properties.args.additionalProperties !== false && def.properties.args.unevaluatedProperties !== false)
      .map(([name]) => name);
    expect(openArgs).toEqual([]);
  });

  // Flattened refs left a generic `call: {type: string}` branch, so any name validated.
  it("validates function names in dynamic values against the catalog's own functions", () => {
    const names = Object.keys(catalog.functions);
    expect(catalog.$defs.anyFunction).toBeDefined();
    expect(catalog.$defs.anyFunction.oneOf.map((b: any) => b.$ref)).toEqual(names.map((n) => `#/functions/${n}`));

    for (const def of ['DynamicString', 'DynamicNumber', 'DynamicBoolean', 'DynamicStringList', 'DynamicValue']) {
      const branches = catalog.$defs[def].oneOf;
      const fnBranch = branches.find((b: any) => b.$ref === '#/$defs/anyFunction');
      expect(fnBranch, `${def} still inlines a generic function branch`).toBeDefined();
    }
    expect(catalog.$defs.Action.properties.functionCall).toEqual({ $ref: '#/$defs/anyFunction' });
  });

  // The markers are web_core's internal ref annotations; they should not reach consumers.
  it('does not leak REF: markers into descriptions', () => {
    const leaked = JSON.stringify(catalog).match(/REF:common_types\.json/g) ?? [];
    expect(leaked.length).toBe(0);
  });
});

describe('the published package', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

  // Consumers outside a bundler (build scripts emitting the catalog for a Go or Python agent)
  // otherwise have to fetch it over the network from a branch that keeps moving.
  it('ships the catalog and exposes it on a stable subpath', () => {
    expect(pkg.files).toContain('catalog');

    const subpath = pkg.exports['./catalog'];
    expect(subpath).toBe('./catalog/vuetify-catalog.json');
    expect(fs.existsSync(path.join(rootDir, subpath))).toBe(true);
  });
});
