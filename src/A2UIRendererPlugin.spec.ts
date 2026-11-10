import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { A2UiVueRenderer } from './A2UIRendererPlugin';
import { A2UI_REGISTRY_KEY, ComponentRegistry, defaultRegistry } from './core/ComponentRegistry';
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

  it('fills and provides an app-specific registry, leaving the shared one alone', () => {
    const mockApp = { component: vi.fn(), provide: vi.fn() };
    const registry = new ComponentRegistry();
    const OnlyHere = defineComponent({ template: '<div>only here</div>' });

    A2UiVueRenderer.install!(mockApp as any, { registry, components: { OnlyHere } });

    expect(registry.get(CATALOG_ID, 'Text')).toBeDefined();
    expect(registry.get(CATALOG_ID, 'OnlyHere')).toBe(OnlyHere);
    expect(defaultRegistry.get(CATALOG_ID, 'OnlyHere')).toBeUndefined();
    expect(mockApp.provide).toHaveBeenCalledWith(A2UI_REGISTRY_KEY, registry);
  });
});
