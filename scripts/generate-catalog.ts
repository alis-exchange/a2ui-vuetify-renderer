import { Catalog } from '@a2ui/web_core/v1_0';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { VUETIFY_COMPONENTS, VUETIFY_COMPONENTS_V1 } from '../src/catalog/vuetify-components';
import { VUETIFY_FUNCTIONS, VUETIFY_FUNCTIONS_V1 } from '../src/catalog/vuetify-functions';
import { buildCatalogDocumentV1 } from '../src/core/catalogDocumentV1';
import { zodToCatalogJson } from '../src/core/zodToCatalogJson';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const catalogDir = path.join(rootDir, 'catalog');
const catalogPath = path.join(catalogDir, 'vuetify-catalog.json');
const catalogPathV1 = path.join(catalogDir, 'vuetify-catalog.v1.json');

// ---------------------------------------------------------------------------
// Static $defs — A2UI protocol primitives shared across all components
// ---------------------------------------------------------------------------

const $defs: Record<string, any> = {
  ComponentCommon: {
    type: 'object',
    properties: {
      component: {
        type: 'string',
        description: 'The name of the component type.',
      },
      id: {
        type: 'string',
        description: 'An optional unique identifier for the component. If not provided, the renderer may assign an internal ID.',
      },
    },
    required: ['component'],
  },
  CatalogComponentCommon: {
    type: 'object',
    properties: {
      weight: {
        type: 'number',
        description: "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column.",
      },
    },
  },
  DynamicString: {
    oneOf: [{ type: 'string' }, { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false }, { $ref: '#/$defs/anyFunction' }],
  },
  DynamicNumber: {
    oneOf: [{ type: 'number' }, { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false }, { $ref: '#/$defs/anyFunction' }],
  },
  DynamicBoolean: {
    oneOf: [{ type: 'boolean' }, { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false }, { $ref: '#/$defs/anyFunction' }],
  },
  DynamicStringList: {
    oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false }, { $ref: '#/$defs/anyFunction' }],
  },
  DynamicValue: {
    oneOf: [{ type: ['string', 'number', 'boolean', 'object', 'array', 'null'] }, { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false }, { $ref: '#/$defs/anyFunction' }],
  },
  ComponentId: {
    type: 'string',
    description: 'A reference to the ID of another component in the components block.',
  },
  ChildList: {
    oneOf: [
      {
        type: 'array',
        items: { $ref: '#/$defs/ComponentId' },
      },
      {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'JSON Pointer path to an array in the data model.' },
          componentId: { type: 'string', description: 'The ID of the template component to render for each item.' },
        },
        required: ['path', 'componentId'],
        additionalProperties: false,
      },
    ],
  },
  Action: {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          context: { type: 'object' },
        },
        required: ['name'],
      },
      functionCall: { $ref: '#/$defs/anyFunction' },
    },
    oneOf: [{ required: ['event'] }, { required: ['functionCall'] }],
    additionalProperties: false,
  },
};

// ---------------------------------------------------------------------------
// Build components dynamically from VUETIFY_COMPONENTS Zod schemas
// ---------------------------------------------------------------------------

function buildComponents(): Record<string, any> {
  const components: Record<string, any> = {};

  for (const api of VUETIFY_COMPONENTS) {
    const converted = zodToCatalogJson(api.schema);

    // Strip meta-properties that conflict with allOf composition
    delete converted.$schema;
    delete converted.additionalProperties;
    // The component's description belongs on the entry itself, where prompt generators look first.
    const description = converted.description;
    delete converted.description;

    // Order matters to A2UI Express, which passes props positionally in the order they are
    // declared (own props, then allOf entries naming `component`, then the other mixins). So
    // the component's own props come before CatalogComponentCommon's shared `weight`.
    components[api.name] = {
      type: 'object',
      ...(description ? { description } : {}),
      allOf: [
        { $ref: '#/$defs/ComponentCommon' },
        {
          type: 'object',
          properties: { component: { const: api.name } },
          required: ['component'],
        },
        converted,
        { $ref: '#/$defs/CatalogComponentCommon' },
      ],
    };
  }

  return components;
}

// ---------------------------------------------------------------------------
// Build functions dynamically from VUETIFY_FUNCTIONS Zod schemas
// ---------------------------------------------------------------------------

/**
 * Who may invoke each function, per `catalog_definition.json`. Read from the runtime
 * implementation so the published JSON and web_core's `RpcHandler` (which enforces it on
 * agent calls) cannot disagree. An absent value means `rendererOnly`, written out explicitly.
 *
 * Every function is renderer-only today: the helpers only make sense while resolving a binding or
 * a check, and `openUrl` needs a user click (`requiresUserActivation`, written out below).
 */
const DEFAULT_ALLOWED_CALLERS = 'rendererOnly';

function buildFunctions(): Record<string, any> {
  const functions: Record<string, any> = {};

  for (const fn of VUETIFY_FUNCTIONS) {
    const argsSchema = zodToCatalogJson(fn.schema);
    delete argsSchema.$schema;

    // No `unevaluatedProperties` on the function object itself: `callFunction` requires
    // `catalogId`, so closing it here rejects every well-formed agent call. `args` stays closed,
    // which is where unknown properties actually matter. This mirrors the upstream basic catalog.
    const fnEntry: Record<string, any> = {
      type: 'object',
      properties: {
        call: { const: fn.name },
        args: argsSchema,
        returnType: { const: fn.returnType },
      },
      required: ['call', 'args'],
      allowedCallers: fn.allowedCallers ?? DEFAULT_ALLOWED_CALLERS,
    };
    if (fn.requiresUserActivation) fnEntry.requiresUserActivation = true;

    // Hoist arg-level description to the function level
    if (argsSchema.description) {
      fnEntry.description = argsSchema.description;
      delete argsSchema.description;
    }

    functions[fn.name] = fnEntry;
  }

  return functions;
}

// ---------------------------------------------------------------------------
// Validation — ensure generated catalog matches registered Vue components
// ---------------------------------------------------------------------------

function getRegisteredComponents(): string[] {
  const defaultCatalogPath = path.join(rootDir, 'src', 'core', 'defaultCatalog.ts');
  if (!fs.existsSync(defaultCatalogPath)) {
    throw new Error(`Could not find defaultCatalog.ts at ${defaultCatalogPath}`);
  }

  const content = fs.readFileSync(defaultCatalogPath, 'utf-8');

  const match = content.match(/\w+\.registerAll\([^,]+,\s*\{([\s\S]*?)\}\s*\);?/);
  if (!match) {
    throw new Error('Could not parse defaultRegistry.registerAll call in defaultCatalog.ts');
  }

  const objectBody = match[1];
  const keys: string[] = [];

  const lines = objectBody.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    const parts = trimmed.split(':');
    if (parts.length > 1) {
      keys.push(parts[0].trim());
    }
  }

  return keys;
}

function validateCatalog(catalogComponents: Record<string, any>, label = 'v0.9'): void {
  const registeredKeys = getRegisteredComponents();
  const catalogKeys = Object.keys(catalogComponents);

  if (process.argv.includes('--test-fail')) {
    catalogKeys.pop();
  }

  const missingInCatalog = registeredKeys.filter((k) => !catalogKeys.includes(k));
  const extraInCatalog = catalogKeys.filter((k) => !registeredKeys.includes(k));

  if (missingInCatalog.length > 0 || extraInCatalog.length > 0) {
    console.error(`Validation Error: ${label} catalog components do not match registered components in defaultCatalog.ts`);
    if (missingInCatalog.length > 0) {
      console.error(`Missing in catalog schema: ${missingInCatalog.join(', ')}`);
    }
    if (extraInCatalog.length > 0) {
      console.error(`Extra in catalog schema (not registered): ${extraInCatalog.join(', ')}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * web_core annotates ref-carrying fields as `REF:<pointer>|<description>` and reads those markers
 * off the Zod schemas at runtime. `zodToJsonSchema` copies the whole string through, so strip the
 * marker here: it is an internal annotation and consumers only want the prose.
 */
function stripRefMarkers(node: any): void {
  if (Array.isArray(node)) {
    for (const item of node) stripRefMarkers(item);
    return;
  }
  if (!node || typeof node !== 'object') return;

  if (typeof node.description === 'string' && node.description.startsWith('REF:')) {
    // `REF:<pointer>|<prose>` — keep the prose; a marker with no `|` carries no prose at all.
    const separator = node.description.indexOf('|');
    if (separator === -1) delete node.description;
    else node.description = node.description.slice(separator + 1);
  }

  for (const value of Object.values(node)) stripRefMarkers(value);
}

function main() {
  const components = buildComponents();
  const functions = buildFunctions();

  // The union the dynamic-value and action branches reference, so a function name inside a
  // component is checked against the catalog's own functions instead of being any string.
  $defs.anyFunction = {
    description: 'A call to any function this catalog declares.',
    oneOf: Object.keys(functions).map((name) => ({ $ref: `#/functions/${name}` })),
  };

  stripRefMarkers(components);
  stripRefMarkers(functions);
  stripRefMarkers($defs);

  const catalog = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json',
    title: 'A2UI Vuetify Catalog',
    description: 'Catalog of A2UI components implemented with Vuetify 4 for the Vue renderer.',
    catalogId: 'https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json',
    components,
    functions,
    $defs,
  };

  validateCatalog(components);

  if (!fs.existsSync(catalogDir)) {
    fs.mkdirSync(catalogDir, { recursive: true });
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`Generated catalog at ${catalogPath}`);

  writeV1Catalog();
}

/**
 * The A2UI v1.0 catalog document, written by web_core itself (`Catalog.toJson()`), so its
 * layout follows `catalog_definition.json`: functions as a map keyed by name, `@call`,
 * `$ref`s into `common_types.json`, and `protocolVersion: "1.0"`. The v0.9 document above is
 * hand-assembled and stays byte-identical; this one is independent of it.
 */
function writeV1Catalog() {
  const doc = buildCatalogDocumentV1(VUETIFY_COMPONENTS_V1);

  // Loading it back is web_core's own catalog validation (identifiers, $refs, closures).
  const reloaded = Catalog.fromJson(doc, '1.0');
  // `@index` and other `@` system functions belong to no catalog, so toJson() leaves them out.
  const catalogFunctions = VUETIFY_FUNCTIONS_V1.filter((fn) => !fn.name.startsWith('@'));
  if (reloaded.components.size !== VUETIFY_COMPONENTS_V1.length || reloaded.functions.size !== catalogFunctions.length) {
    console.error(`Validation Error: v1.0 catalog round trip lost entries (${reloaded.components.size} components, ${reloaded.functions.size} functions)`);
    process.exit(1);
  }
  validateCatalog(doc.components, 'v1.0');

  fs.writeFileSync(catalogPathV1, JSON.stringify(doc, null, 2) + '\n', 'utf-8');
  console.log(`Generated catalog at ${catalogPathV1}`);
}

main();
