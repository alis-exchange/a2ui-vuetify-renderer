import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UIModal from './A2UIModal.vue';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify();

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock('../composables/useDynamicProps', async (importOriginal) => {
  const vue = await import('vue');
  return {
    useDynamicProps: (nodeArg: any) => {
      const node = typeof nodeArg === 'function' ? nodeArg() : nodeArg;
      return vue.ref({
        id: node.id || 'modal-1',
        trigger: node.trigger,
        content: node.content,
        open: node.open || false
      });
    }
  };
});

describe('A2UIModal.vue', () => {
  it('renders a vuetify dialog', () => {
    const mockNode = {
      id: 'modal-1',
      type: 'Modal',
      trigger: 'trigger-comp',
      content: 'content-comp'
    };

    const wrapper = mount(A2UIModal, {
      props: { node: mockNode },
      global: {
        plugins: [vuetify],
        stubs: {
          A2uiComponentNode: true
        }
      }
    });

    expect(wrapper.findComponent({ name: 'v-dialog' }).exists()).toBe(true);
  });
});
