import { describe, expect, it } from 'vitest';
import * as exports from '../src/index';

describe('index.ts', () => {
  it('should export CATALOG_ID constant', () => {
    expect(exports.CATALOG_ID).toBeDefined();
    expect(exports.CATALOG_ID).toBe('https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json');
  });

  // The catalog is already inlined in the bundle; without this export, reaching it means
  // constructing a ComponentRegistry and calling getCatalogSchema, which exists to merge in
  // custom components rather than to hand back the base document.
  it('should export VUETIFY_CATALOG as the base catalog document', () => {
    const catalog = exports.VUETIFY_CATALOG as any;
    expect(catalog).toBeDefined();
    expect(catalog.catalogId).toBe(exports.CATALOG_ID);
    expect(Object.keys(catalog.components).length).toBeGreaterThan(0);
    expect(Object.keys(catalog.functions).length).toBeGreaterThan(0);
    expect(catalog.$defs.anyFunction).toBeDefined();
  });

  it('should export getCatalogSchema', () => {
    expect(exports.getCatalogSchema).toBeDefined();
    expect(typeof exports.getCatalogSchema).toBe('function');
  });

  it('should export catalogFilters with convenience helpers', () => {
    expect(exports.catalogFilters).toBeDefined();
    expect(typeof exports.catalogFilters.customOnly).toBe('function');
    expect(typeof exports.catalogFilters.only).toBe('function');
    expect(typeof exports.catalogFilters.exclude).toBe('function');
  });

  it('should export registerDefaultComponents', () => {
    expect(exports.registerDefaultComponents).toBeDefined();
    expect(typeof exports.registerDefaultComponents).toBe('function');
  });

  it('should export the Vuetify catalog function factory and openUrl override', () => {
    expect(typeof exports.createVuetifyFunctions).toBe('function');
    expect(Array.isArray(exports.VUETIFY_FUNCTIONS)).toBe(true);
    expect(exports.VuetifyOpenUrlImplementation.name).toBe('openUrl');
  });

  it('should export useChecks for custom components', () => {
    expect(typeof exports.useChecks).toBe('function');
  });

  it('should export the v1.0 catalog id, kits and component APIs', () => {
    expect(exports.CATALOG_ID_V1).toBe('https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.v1.json');
    expect(exports.A2UI_V09.version).toBe('v0.9');
    expect(exports.A2UI_V10.version).toBe('v1.0');
    expect(exports.VUETIFY_COMPONENTS_V1.map((api) => api.name)).toEqual(exports.VUETIFY_COMPONENTS.map((api) => api.name));
    expect(exports.buildVuetifyComponents(exports.A2UI_V10).length).toBe(exports.VUETIFY_COMPONENTS_V1.length);
  });

  it('should export useBinding', () => {
    expect(typeof exports.useBinding).toBe('function');
  });

  it('should export the v1.0 catalog document and functions', () => {
    expect((exports.VUETIFY_CATALOG_V1 as any).catalogId).toBe(exports.CATALOG_ID_V1);
    expect(exports.VUETIFY_FUNCTIONS_V1.find((fn) => fn.name === 'openUrl')).toBe(exports.VuetifyOpenUrlImplementationV1);
  });
});
