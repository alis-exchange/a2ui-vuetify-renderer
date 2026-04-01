import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIModal from './A2UIModal.vue';

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
        id: node.id || 'modal-1',
        trigger: node.trigger,
        content: node.content,
        open: node.open || false,
      });
    },
  };
});

function createMockContext() {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: {
      model: {
        getSurface: vi.fn().mockReturnValue({}),
      },
    },
    dataContextPath: '/',
  };
}

describe('A2UIModal.vue', () => {
  it('renders a vuetify dialog', () => {
    const mockNode = {
      id: 'modal-1',
      type: 'Modal',
      trigger: 'trigger-comp',
      content: 'content-comp',
    };

    const wrapper = mount(A2UIModal, {
      props: { node: mockNode },
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
        stubs: {
          A2uiComponentNode: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'v-dialog' }).exists()).toBe(true);
  });
});
