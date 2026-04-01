import { describe, expect, it } from 'vitest';
import baseCatalog from '../../catalog/vuetify-catalog.json';
import { defaultRegistry } from './ComponentRegistry';
import { CATALOG_ID } from './constants';
import { getCatalogSchema } from './getCatalogSchema';

describe('getCatalogSchema', () => {
  it('should return a valid JSON schema object', () => {
    const schema = getCatalogSchema(defaultRegistry, CATALOG_ID);
    expect(schema).toBeDefined();
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(schema.components).toBeDefined();

    // Should contain all base catalog components
    const baseKeys = Object.keys(baseCatalog.components);
    for (const key of baseKeys) {
      expect(schema.components[key]).toBeDefined();
    }
  });

  it('should include dynamically registered components', () => {
    const dummyComponent = {}; // Just a fake Vue component
    defaultRegistry.register(CATALOG_ID, 'CustomComponent', dummyComponent as any);

    const schema = getCatalogSchema(defaultRegistry, CATALOG_ID);
    expect(schema.components['CustomComponent']).toBeDefined();
    expect(schema.components['CustomComponent'].type).toBe('object');

    // Cleanup
    // There is no unregister in ComponentRegistry, but we can clear or just ignore
  });
});
