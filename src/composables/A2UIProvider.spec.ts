import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UIProvider from './A2UIProvider.vue';
import { defineComponent, inject, h, nextTick } from 'vue';
import { A2UI_CONTEXT_KEY } from './useA2UI';
import { createVuetify } from 'vuetify';
import { VThemeProvider } from 'vuetify/components';

describe('A2UIProvider.vue', () => {
  let vuetify: any;

  beforeEach(() => {
    vuetify = createVuetify();
  });

  it('provides the processor, surfaceId, and onAction to its children', () => {
    const ChildComponent = defineComponent({
      setup() {
        const context = inject(A2UI_CONTEXT_KEY);
        return { context };
      },
      template: '<div class="child">{{ context?.surfaceId }}</div>',
    });

    const mockProcessor = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      model: {
        getSurface: vi.fn().mockReturnValue({ theme: {} })
      }
    };

    const wrapper = mount(A2UIProvider, {
      global: {
        plugins: [vuetify]
      },
      props: {
        processor: mockProcessor as any,
        surfaceId: 'my-surface',
        onAction: () => {},
      },
      slots: {
        default: () => h(ChildComponent),
      }
    });

    expect(wrapper.find('.child').text()).toBe('my-surface');
    expect(mockProcessor.addEventListener).toHaveBeenCalledWith('update', expect.any(Function));
  });

  it('cleans up processor listeners and registered theme on unmount', () => {
    const mockProcessor = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      model: {
        getSurface: vi.fn().mockReturnValue({ theme: { primaryColor: '#123456' } })
      }
    };

    const wrapper = mount(A2UIProvider, {
      global: {
        plugins: [vuetify]
      },
      props: {
        processor: mockProcessor as any,
        surfaceId: 'test-surface',
      },
    });
    
    // Theme should be registered
    expect(vuetify.theme.themes.value['a2ui-theme-test-surface']).toBeDefined();

    wrapper.unmount();
    expect(mockProcessor.removeEventListener).toHaveBeenCalledWith('update', expect.any(Function));
    
    // Theme should be removed
    expect(vuetify.theme.themes.value['a2ui-theme-test-surface']).toBeUndefined();
  });

  it('dynamically registers a theme without mutating the global theme', async () => {
    const originalPrimary = vuetify.theme.global.current.value.colors.primary;
    
    const mockProcessor = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      model: {
        getSurface: vi.fn().mockReturnValue({ 
          theme: {
            primaryColor: '#ff0000',
            errorColor: '#00ff00',
            backgroundColor: '#0000ff',
            surfaceColor: '#123456'
          } 
        })
      }
    };

    const wrapper = mount(A2UIProvider, {
      global: {
        plugins: [vuetify]
      },
      props: {
        processor: mockProcessor as any,
        surfaceId: 'my-surface',
      },
    });

    await nextTick();

    // Global theme should NOT be mutated
    expect(vuetify.theme.global.current.value.colors.primary).toBe(originalPrimary);

    // A specific theme should be registered
    const customTheme = vuetify.theme.themes.value['a2ui-theme-my-surface'];
    expect(customTheme).toBeDefined();
    expect(customTheme.colors.primary).toBe('#ff0000');
    expect(customTheme.colors.error).toBe('#00ff00');
    expect(customTheme.colors.background).toBe('#0000ff');
    expect(customTheme.colors.surface).toBe('#123456');

    // Provider should render a v-theme-provider
    const themeProvider = wrapper.findComponent(VThemeProvider);
    expect(themeProvider.exists()).toBe(true);
    expect(themeProvider.props('theme')).toBe('a2ui-theme-my-surface');
  });

  it('does not register a custom theme if no theme overrides are provided', async () => {
    const mockProcessor = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      model: {
        getSurface: vi.fn().mockReturnValue({}) // No theme
      }
    };

    const wrapper = mount(A2UIProvider, {
      global: {
        plugins: [vuetify]
      },
      props: {
        processor: mockProcessor as any,
        surfaceId: 'no-theme-surface',
      },
    });

    await nextTick();

    // Should not register a theme
    expect(vuetify.theme.themes.value['a2ui-theme-no-theme-surface']).toBeUndefined();
    
    // v-theme-provider should either not exist, or should have no theme prop
    const themeProvider = wrapper.findComponent(VThemeProvider);
    if (themeProvider.exists()) {
      expect(themeProvider.props('theme')).toBeUndefined();
    }
  });
});
