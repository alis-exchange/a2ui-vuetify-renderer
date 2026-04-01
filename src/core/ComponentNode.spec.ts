import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import ComponentNode from './ComponentNode.vue';
import { A2UI_REGISTRY_KEY, ComponentRegistry } from './ComponentRegistry';
import { CATALOG_ID } from './constants';

const MockButton = defineComponent({
  props: ['node'],
  template: '<button class="mock-btn">{{ node.id }}</button>',
});

describe('ComponentNode.vue', () => {
  it('renders a registered component and passes the node', () => {
    const registry = new ComponentRegistry();
    registry.register(CATALOG_ID, 'Button', MockButton);

    const mockNode = { id: 'btn-1', type: 'Button', properties: {} };

    const mockContext = {
      surfaceId: 'surf-1',
      processor: {
        model: {
          getSurface: () => ({
            componentsModel: {
              get: (id: string) => (id === 'btn-1' ? mockNode : undefined),
            },
          }),
        },
      },
    };

    const wrapper = mount(ComponentNode, {
      props: { id: 'btn-1' },
      global: {
        provide: {
          [A2UI_CONTEXT_KEY as symbol]: mockContext,
          [A2UI_REGISTRY_KEY as symbol]: registry,
        },
      },
    });

    expect(wrapper.find('.mock-btn').exists()).toBe(true);
    expect(wrapper.text()).toBe('btn-1');
  });

  it('applies flex-grow class based on node weight property', () => {
    const registry = new ComponentRegistry();
    registry.register(CATALOG_ID, 'Button', MockButton);

    const mockNode = { id: 'btn-weight', type: 'Button', properties: { weight: 2 } };

    const mockContext = {
      surfaceId: 'surf-1',
      processor: {
        model: {
          getSurface: () => ({
            componentsModel: {
              get: () => mockNode,
            },
          }),
        },
      },
    };

    const wrapper = mount(ComponentNode, {
      props: { id: 'btn-weight' },
      global: {
        provide: {
          [A2UI_CONTEXT_KEY as symbol]: mockContext,
          [A2UI_REGISTRY_KEY as symbol]: registry,
        },
      },
    });

    expect(wrapper.find('.mock-btn').classes()).toContain('flex-grow-2');
  });

  it('renders an error fallback if component type is unknown', () => {
    const registry = new ComponentRegistry();
    const mockNode = { id: 'unk-1', type: 'UnknownComponentType', properties: {} };

    const mockContext = {
      surfaceId: 'surf-1',
      processor: {
        model: {
          getSurface: () => ({
            componentsModel: {
              get: () => mockNode,
            },
          }),
        },
      },
    };

    const wrapper = mount(ComponentNode, {
      props: { id: 'unk-1' },
      global: {
        provide: {
          [A2UI_CONTEXT_KEY as symbol]: mockContext,
          [A2UI_REGISTRY_KEY as symbol]: registry,
        },
      },
    });

    expect(wrapper.text()).toContain('Unknown component type: UnknownComponentType');
    expect(wrapper.find('.a2ui-error-fallback').exists()).toBe(true);
  });
});
