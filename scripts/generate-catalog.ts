import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { VUETIFY_COMPONENTS } from '../src/catalog/vuetify-components';
import { VUETIFY_FUNCTIONS } from '../src/catalog/vuetify-functions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const catalogDir = path.join(rootDir, 'catalog');
const catalogPath = path.join(catalogDir, 'vuetify-catalog.json');

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
        description:
          "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column.",
      },
    },
  },
  DynamicString: {
    oneOf: [
      { type: 'string' },
      { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false },
      { type: 'object', properties: { call: { type: 'string' }, args: { type: 'object' } }, required: ['call'], additionalProperties: true },
    ],
  },
  DynamicNumber: {
    oneOf: [
      { type: 'number' },
      { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false },
      { type: 'object', properties: { call: { type: 'string' }, args: { type: 'object' } }, required: ['call'], additionalProperties: true },
    ],
  },
  DynamicBoolean: {
    oneOf: [
      { type: 'boolean' },
      { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false },
      { type: 'object', properties: { call: { type: 'string' }, args: { type: 'object' } }, required: ['call'], additionalProperties: true },
    ],
  },
  DynamicStringList: {
    oneOf: [
      { type: 'array', items: { type: 'string' } },
      { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false },
      { type: 'object', properties: { call: { type: 'string' }, args: { type: 'object' } }, required: ['call'], additionalProperties: true },
    ],
  },
  DynamicValue: {
    oneOf: [
      { type: ['string', 'number', 'boolean', 'object', 'array', 'null'] },
      { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false },
      { type: 'object', properties: { call: { type: 'string' }, args: { type: 'object' } }, required: ['call'], additionalProperties: true },
    ],
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
      functionCall: {
        type: 'object',
        properties: {
          call: { type: 'string' },
          args: { type: 'object' },
        },
        required: ['call'],
      },
    },
    oneOf: [{ required: ['event'] }, { required: ['functionCall'] }],
    additionalProperties: false,
  },
  Checkable: {
    type: 'object',
    properties: {
      checks: {
        type: 'array',
        description: 'An optional list of function calls that return a boolean to evaluate the validity or disabled state of the component.',
        items: {
          type: 'object',
          properties: {
            call: { type: 'string' },
            args: { type: 'object' },
            errorMessage: { type: 'string' },
            disableOnFail: { type: 'boolean', default: false },
          },
          required: ['call'],
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Build components dynamically from VUETIFY_COMPONENTS Zod schemas
// ---------------------------------------------------------------------------

function buildComponents(): Record<string, any> {
  const components: Record<string, any> = {};

  for (const api of VUETIFY_COMPONENTS) {
    const converted = zodToJsonSchema(api.schema, { $refStrategy: 'none' }) as Record<string, any>;

    // Strip meta-properties that conflict with allOf composition
    delete converted.$schema;
    delete converted.additionalProperties;

    components[api.name] = {
      type: 'object',
      allOf: [
        { $ref: '#/$defs/ComponentCommon' },
        { $ref: '#/$defs/CatalogComponentCommon' },
        {
          type: 'object',
          properties: { component: { const: api.name } },
          required: ['component'],
        },
        converted,
      ],
    };
  }

  return components;
}

// ---------------------------------------------------------------------------
// Build functions dynamically from VUETIFY_FUNCTIONS Zod schemas
// ---------------------------------------------------------------------------

function buildFunctions(): Record<string, any> {
  const functions: Record<string, any> = {};

  for (const fn of VUETIFY_FUNCTIONS) {
    const argsSchema = zodToJsonSchema(fn.schema, { $refStrategy: 'none' }) as Record<string, any>;
    delete argsSchema.$schema;

    const fnEntry: Record<string, any> = {
      type: 'object',
      properties: {
        call: { const: fn.name },
        args: argsSchema,
        returnType: { const: fn.returnType },
      },
      required: ['call', 'args'],
      unevaluatedProperties: false,
    };

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

  const match = content.match(/defaultRegistry\.registerAll\([^,]+,\s*\{([\s\S]*?)\}\s*\);?/);
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

function validateCatalog(catalogComponents: Record<string, any>): void {
  const registeredKeys = getRegisteredComponents();
  const catalogKeys = Object.keys(catalogComponents);

  if (process.argv.includes('--test-fail')) {
    catalogKeys.pop();
  }

  const missingInCatalog = registeredKeys.filter((k) => !catalogKeys.includes(k));
  const extraInCatalog = catalogKeys.filter((k) => !registeredKeys.includes(k));

  if (missingInCatalog.length > 0 || extraInCatalog.length > 0) {
    console.error('Validation Error: Catalog components do not match registered components in defaultCatalog.ts');
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

function main() {
  const components = buildComponents();
  const functions = buildFunctions();

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
}

main();
