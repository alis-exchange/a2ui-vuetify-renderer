import { describe, it, expect, vi } from 'vitest';
import { A2UiVueRenderer } from './A2UIRendererPlugin';
import { defaultRegistry } from './core/ComponentRegistry';
import { defineComponent } from 'vue';

describe('A2UIRendererPlugin', () => {
  it('installs the required components globally and registers options', () => {
    const mockApp = {
      component: vi.fn()
    };

    const MockCustomButton = defineComponent({ template: '<button>Custom</button>' });

    A2UiVueRenderer.install!(mockApp as any, {
      components: {
        'CustomButton': MockCustomButton
      }
    });

    expect(mockApp.component).toHaveBeenCalledWith('A2uiProvider', expect.anything());
    expect(mockApp.component).toHaveBeenCalledWith('A2uiComponentNode', expect.anything());
    
    // verify registry
    expect(defaultRegistry.get('CustomButton')).toBe(MockCustomButton);
  });
});
