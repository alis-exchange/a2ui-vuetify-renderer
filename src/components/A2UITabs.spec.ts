import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UITabs from './A2UITabs.vue';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify();

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock('../composables/useDynamicProps', async () => {
  const vue = await import('vue');
  return {
    useDynamicProps: (nodeArg: any) => {
      const node = typeof nodeArg === 'function' ? nodeArg() : nodeArg;
      return vue.ref({
        id: node.id || 'tabs-1',
        tabs: node.tabs || []
      });
    }
  };
});

function createMockContext() {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: {
      model: {
        getSurface: vi.fn().mockReturnValue({})
      }
    },
    dataContextPath: '/'
  };
}

describe('A2UITabs.vue', () => {
  it('renders vuetify tabs and panels', () => {
    const mockNode = {
      id: 'tabs-1',
      type: 'Tabs',
      tabs: [
        { title: 'Tab 1', child: 'child-1' },
        { title: 'Tab 2', child: 'child-2' }
      ]
    };

    const wrapper = mount(A2UITabs, {
      props: { node: mockNode },
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
        stubs: {
          A2uiComponentNode: true
        }
      }
    });

    expect(wrapper.findComponent({ name: 'v-tabs' }).exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: 'v-tab' }).length).toBe(2);
    expect(wrapper.findComponent({ name: 'v-tabs-window' }).exists()).toBe(true);
  });
});
