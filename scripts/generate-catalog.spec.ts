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
const catalogPathV1 = path.join(catalogDir, 'vuetify-catalog.v1.json');
const scriptPath = path.join(__dirname, 'generate-catalog.ts');

describe('generate-catalog.ts', () => {
  // Read before the first test regenerates the file in place, so a schema change without a
  // regenerated catalog fails here (in CI, on a clean checkout) instead of shipping stale JSON.
  const committed = fs.existsSync(catalogPath) ? fs.readFileSync(catalogPath, 'utf-8') : undefined;
  const committedV1 = fs.existsSync(catalogPathV1) ? fs.readFileSync(catalogPathV1, 'utf-8') : undefined;

  beforeAll(() => {
    if (!fs.existsSync(catalogDir)) {
      fs.mkdirSync(catalogDir, { recursive: true });
    }
  });

  it('should generate vuetify-catalog.json containing $defs', { timeout: 30_000 }, () => {
    execSync(`npx tsx ${scriptPath}`, { cwd: rootDir, stdio: 'inherit' });

    expect(fs.existsSync(catalogPath)).toBe(true);

    const content = fs.readFileSync(catalogPath, 'utf-8');
    expect(content, 'catalog/vuetify-catalog.json is stale: run pnpm generate:catalog and commit it').toBe(committed);
    expect(fs.readFileSync(catalogPathV1, 'utf-8'), 'catalog/vuetify-catalog.v1.json is stale: run pnpm generate:catalog and commit it').toBe(committedV1);
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

  it('should fail if a generated catalog does not list every built-in component', { timeout: 30_000 }, () => {
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

  // An absent allowedCallers means rendererOnly; write it out so consumers need not know the default.
  it('declares allowedCallers on every function and gates openUrl on a user click', () => {
    const undeclared = Object.entries<any>(catalog.functions)
      .filter(([, def]) => def.allowedCallers === undefined)
      .map(([name]) => name);
    expect(undeclared).toEqual([]);

    const legal = ['rendererOnly', 'agentOnly', 'rendererOrAgent'];
    for (const [name, def] of Object.entries<any>(catalog.functions)) {
      expect(legal, `${name} declares an unknown allowedCallers`).toContain(def.allowedCallers);
    }
    expect(catalog.functions.openUrl.allowedCallers).toBe('rendererOnly');
    expect(catalog.functions.openUrl.requiresUserActivation).toBe(true);
    const gated = Object.entries<any>(catalog.functions)
      .filter(([, def]) => def.requiresUserActivation)
      .map(([name]) => name);
    expect(gated).toEqual(['openUrl']);
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

// A2UI Express (the agent SDK's compact inference format) passes component props by position,
// in declaration order, and shows each component's description next to its signature.
describe('prompt-friendly catalogs (A2UI Express)', () => {
  const SHARED = new Set(['weight', 'accessibility']);
  const v09 = () => JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  const v10 = () => JSON.parse(fs.readFileSync(catalogPathV1, 'utf-8'));
  /** Own props in the order Express reads them, shared props anywhere but last flagged. */
  const sharedNotLast = (keys: string[]) => {
    const firstShared = keys.findIndex((k) => SHARED.has(k));
    return firstShared !== -1 && keys.slice(firstShared).some((k) => !SHARED.has(k));
  };

  it('describes every component in both documents', () => {
    for (const doc of [v09(), v10()]) {
      const missing = Object.entries<any>(doc.components)
        .filter(([, def]) => typeof def.description !== 'string' || def.description.length < 10)
        .map(([name]) => name);
      expect(missing).toEqual([]);
    }
  });

  it("declares shared props after each component's own (v1.0)", () => {
    const late = Object.entries<any>(v10().components)
      .filter(([, def]) => sharedNotLast(Object.keys(def.properties).filter((k) => k !== 'component')))
      .map(([name]) => name);
    expect(late).toEqual([]);
  });

  it("declares shared props after each component's own (v0.9)", () => {
    for (const [name, def] of Object.entries<any>(v09().components)) {
      const refs = def.allOf.map((entry: any) => entry.$ref ?? 'own');
      expect(refs.indexOf('#/$defs/CatalogComponentCommon'), name).toBe(refs.length - 1);
      const own = def.allOf.find((entry: any) => !entry.$ref && !entry.properties?.component);
      expect(sharedNotLast(Object.keys(own.properties)), name).toBe(false);
    }
  });
});

// Runs after the suite above has regenerated both documents.
describe('the v1.0 catalog document', () => {
  const doc = () => JSON.parse(fs.readFileSync(catalogPathV1, 'utf-8'));

  it('is a v1.0 catalog_definition named by CATALOG_ID_V1', () => {
    const v1 = doc();
    expect(v1.protocolVersion).toBe('1.0');
    expect(v1.$id).toBe(v1.catalogId);
    expect(v1.catalogId).toBe('https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.v1.json');
    expect(Array.isArray(v1.functions)).toBe(false);
    expect(Object.keys(v1.components)).toEqual(Object.keys(JSON.parse(fs.readFileSync(catalogPath, 'utf-8')).components));
  });

  it('lists only the specification functions, without the @index system function', () => {
    expect(Object.keys(doc().functions).sort()).toEqual(['and', 'email', 'formatCurrency', 'formatDate', 'formatNumber', 'formatString', 'length', 'not', 'numeric', 'openUrl', 'or', 'pluralize', 'regex', 'required']);
  });

  it('gates openUrl on a user click and keeps it renderer-only', () => {
    const openUrl = doc().functions.openUrl;
    expect(openUrl.allowedCallers).toBe('rendererOnly');
    expect(openUrl.requiresUserActivation).toBe(true);
  });

  it('declares no envelope keys on components', () => {
    for (const [name, def] of Object.entries<any>(doc().components)) {
      for (const key of ['id', 'catalogId', 'accessibility', 'metadata']) {
        expect(def.properties?.[key], `${name}.${key}`).toBeUndefined();
      }
    }
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

    const subpathV1 = pkg.exports['./catalog/v1'];
    expect(subpathV1).toBe('./catalog/vuetify-catalog.v1.json');
    expect(fs.existsSync(path.join(rootDir, subpathV1))).toBe(true);
  });
});
