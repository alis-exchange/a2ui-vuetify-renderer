import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry } from './ComponentRegistry';
import { defineComponent } from 'vue';

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
      Text: mockComponent
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
      Text: mockComponent
    });
    
    const keys = registry.keys('my-catalog');
    expect(keys).toContain('Button');
    expect(keys).toContain('Text');
    expect(keys.length).toBe(2);
    
    expect(registry.keys('empty-catalog').length).toBe(0);
  });
});
