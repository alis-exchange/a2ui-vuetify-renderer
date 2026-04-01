import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { A2UiVueRenderer } from './A2UIRendererPlugin';
import { defaultRegistry } from './core/ComponentRegistry';
import { CATALOG_ID } from './core/constants';

describe('A2UIRendererPlugin', () => {
  it('installs the required components globally and registers options', () => {
    const mockApp = {
      component: vi.fn(),
    };

    const MockCustomButton = defineComponent({ template: '<button>Custom</button>' });

    A2UiVueRenderer.install!(mockApp as any, {
      components: {
        CustomButton: MockCustomButton,
      },
    });

    expect(mockApp.component).toHaveBeenCalledWith('A2uiProvider', expect.anything());
    expect(mockApp.component).toHaveBeenCalledWith('A2uiComponentNode', expect.anything());

    // verify registry
    expect(defaultRegistry.get(CATALOG_ID, 'CustomButton')).toBe(MockCustomButton);
  });
});
