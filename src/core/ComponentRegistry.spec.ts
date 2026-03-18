import { describe, it, expect } from 'vitest';
import { ComponentRegistry } from './ComponentRegistry';
import { defineComponent } from 'vue';

describe('ComponentRegistry', () => {
  it('registers and retrieves components', () => {
    const registry = new ComponentRegistry();
    const MockComponent = defineComponent({ template: '<div>Mock</div>' });
    
    registry.register('Button', MockComponent);
    
    expect(registry.get('Button')).toBe(MockComponent);
  });

  it('returns undefined for unregistered components', () => {
    const registry = new ComponentRegistry();
    expect(registry.get('Unknown')).toBeUndefined();
  });

  it('can register multiple components at once', () => {
    const registry = new ComponentRegistry();
    const MockButton = defineComponent({ template: '<button>Btn</button>' });
    const MockText = defineComponent({ template: '<span>Txt</span>' });

    registry.registerAll({
      Button: MockButton,
      Text: MockText,
    });

    expect(registry.get('Button')).toBe(MockButton);
    expect(registry.get('Text')).toBe(MockText);
  });
});
