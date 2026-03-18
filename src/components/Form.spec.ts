import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UIForm from './A2UIForm.vue';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify();

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

describe('A2UIForm', () => {
  it('renders a form with children', () => {
    const wrapper = mount(A2UIForm, {
      global: {
        provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
        plugins: [vuetify],
        stubs: {
          ComponentNode: {
            template: '<div class="child-node" :data-id="id"></div>',
            props: ['id']
          }
        }
      },
      props: {
        node: {
          id: 'form1', type: 'Form', properties: { children: ['child1', 'child2'] }
        } as any
      }
    });

    const form = wrapper.findComponent({ name: 'VForm' });
    expect(form.exists()).toBe(true);

    const children = wrapper.findAll('.child-node');
    expect(children.length).toBe(2);
    expect(children[0].attributes('data-id')).toBe('child1');
    expect(children[1].attributes('data-id')).toBe('child2');
  });
});
