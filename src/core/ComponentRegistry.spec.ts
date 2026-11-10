import { beforeEach, describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { ComponentRegistry } from './ComponentRegistry';
import { CATALOG_ID, CATALOG_ID_V1 } from './constants';

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;
  const mockComponent = defineComponent({ template: '<div>Mock</div>' });

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  it('should register a component for a specific catalogId', () => {
    registry.register('my-catalog', 'Button', mockComponent);
    expect(registry.get('my-catalog', 'Button')).toBe(mockComponent);
  });

  it('should return undefined if the component is not in the specified catalogId', () => {
    registry.register('catalog-a', 'Button', mockComponent);
    expect(registry.get('catalog-b', 'Button')).toBeUndefined();
  });

  it('should register multiple components for a catalogId using registerAll', () => {
    registry.registerAll('my-catalog', {
      Button: mockComponent,
      Text: mockComponent,
    });

    expect(registry.get('my-catalog', 'Button')).toBe(mockComponent);
    expect(registry.get('my-catalog', 'Text')).toBe(mockComponent);
  });

  it('should check if a component exists for a catalogId', () => {
    registry.register('my-catalog', 'Button', mockComponent);
    expect(registry.has('my-catalog', 'Button')).toBe(true);
    expect(registry.has('other-catalog', 'Button')).toBe(false);
  });

  it('should get keys for a specific catalogId', () => {
    registry.registerAll('my-catalog', {
      Button: mockComponent,
      Text: mockComponent,
    });

    const keys = registry.keys('my-catalog');
    expect(keys).toContain('Button');
    expect(keys).toContain('Text');
    expect(keys.length).toBe(2);

    expect(registry.keys('empty-catalog').length).toBe(0);
  });

  describe('v0.9 and v1.0 Vuetify catalogs', () => {
    it('share one component map, whichever id registers', () => {
      registry.register(CATALOG_ID, 'Button', mockComponent);
      const v1Only = defineComponent({ template: '<div>v1</div>' });
      registry.register(CATALOG_ID_V1, 'Chart', v1Only);

      expect(registry.get(CATALOG_ID_V1, 'Button')).toBe(mockComponent);
      expect(registry.get(CATALOG_ID, 'Chart')).toBe(v1Only);
      expect(registry.keys(CATALOG_ID_V1).sort()).toEqual(['Button', 'Chart']);
      expect(registry.has(CATALOG_ID_V1, 'Button')).toBe(true);
    });

    it('keep schemas per version', () => {
      const v09 = { name: 'Chart', schema: {} } as any;
      const v10 = { name: 'Chart', schema: {} } as any;
      registry.register(CATALOG_ID, 'Chart', mockComponent, v09);
      registry.registerApi(CATALOG_ID_V1, 'Chart', v10);

      expect(registry.getApi(CATALOG_ID, 'Chart')).toBe(v09);
      expect(registry.getApi(CATALOG_ID_V1, 'Chart')).toBe(v10);
    });

    it('leave other catalogs separate', () => {
      registry.register('other', 'Button', mockComponent);
      expect(registry.get(CATALOG_ID, 'Button')).toBeUndefined();
    });
  });
});
