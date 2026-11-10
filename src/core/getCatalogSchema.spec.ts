import { DynamicStringSchema } from '@a2ui/web_core/v0_9';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import baseCatalog from '../../catalog/vuetify-catalog.json';
import { catalogFilters } from './catalogFilters';
import { ComponentRegistry, defaultRegistry } from './ComponentRegistry';
import { CATALOG_ID } from './constants';
import { getCatalogSchema } from './getCatalogSchema';

const baseKeys = Object.keys(baseCatalog.components);

describe('getCatalogSchema', () => {
  it('should return a valid JSON schema object', () => {
    const schema = getCatalogSchema(defaultRegistry, CATALOG_ID);
    expect(schema).toBeDefined();
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(schema.components).toBeDefined();

    for (const key of baseKeys) {
      expect(schema.components[key]).toBeDefined();
    }
  });

  it('should include dynamically registered components', () => {
    const dummyComponent = {};
    defaultRegistry.register(CATALOG_ID, 'CustomComponent', dummyComponent as any);

    const schema = getCatalogSchema(defaultRegistry, CATALOG_ID);
    expect(schema.components['CustomComponent']).toBeDefined();
    expect(schema.components['CustomComponent'].type).toBe('object');
  });

  it('writes a custom bindable prop compactly, without expanding function-call args', () => {
    const registry = new ComponentRegistry();
    registry.register(CATALOG_ID, 'Greeting', {} as any, { name: 'Greeting', schema: z.object({ text: DynamicStringSchema }).strict() } as any);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const schema = getCatalogSchema(registry, CATALOG_ID);
    const text = schema.components.Greeting.allOf[3].properties.text;
    const call = text.anyOf.find((branch: any) => branch.properties?.call);

    expect(call.properties.args).toEqual({ type: 'object', additionalProperties: {}, description: 'Arguments passed to the function.' });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  describe('filter option', () => {
    it('should return all components when no filter is provided', () => {
      const schema = getCatalogSchema(defaultRegistry, CATALOG_ID);
      expect(Object.keys(schema.components).length).toBeGreaterThanOrEqual(baseKeys.length);
    });

    it('should keep only components that pass the filter predicate', () => {
      const schema = getCatalogSchema(defaultRegistry, CATALOG_ID, {
        filter: (name) => name === 'Button' || name === 'Text',
      });

      expect(Object.keys(schema.components).sort()).toEqual(['Button', 'Text']);
    });

    it('should return an empty components map when filter rejects everything', () => {
      const schema = getCatalogSchema(defaultRegistry, CATALOG_ID, {
        filter: () => false,
      });

      expect(Object.keys(schema.components)).toHaveLength(0);
    });

    it('should preserve $defs and top-level fields when filtering', () => {
      const schema = getCatalogSchema(defaultRegistry, CATALOG_ID, {
        filter: (name) => name === 'Button',
      });

      expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
      expect(schema.$defs).toBeDefined();
      expect(Object.keys(schema.components)).toEqual(['Button']);
    });
  });

  describe('catalogFilters.customOnly', () => {
    it('should exclude all base catalog components', () => {
      const registry = new ComponentRegistry();
      registry.register(CATALOG_ID, 'Button', {} as any);
      registry.register(CATALOG_ID, 'MyWidget', {} as any);

      const schema = getCatalogSchema(registry, CATALOG_ID, {
        filter: catalogFilters.customOnly,
      });

      for (const key of baseKeys) {
        expect(schema.components[key]).toBeUndefined();
      }
      expect(schema.components['MyWidget']).toBeDefined();
    });
  });

  describe('catalogFilters.only', () => {
    it('should keep only the listed components', () => {
      const schema = getCatalogSchema(defaultRegistry, CATALOG_ID, {
        filter: catalogFilters.only('Card', 'Tabs', 'Modal'),
      });

      expect(Object.keys(schema.components).sort()).toEqual(['Card', 'Modal', 'Tabs']);
    });
  });

  describe('catalogFilters.exclude', () => {
    it('should remove the listed components and keep everything else', () => {
      const schema = getCatalogSchema(defaultRegistry, CATALOG_ID, {
        filter: catalogFilters.exclude('Table', 'Calendar'),
      });

      expect(schema.components['Table']).toBeUndefined();
      expect(schema.components['Calendar']).toBeUndefined();
      expect(schema.components['Button']).toBeDefined();
      expect(schema.components['Text']).toBeDefined();
    });
  });
});
