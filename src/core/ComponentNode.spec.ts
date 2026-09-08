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

describe('ComponentNode.vue in node mode', async () => {
  const { Catalog, MessageProcessor, NodeResolver, getValue } = await import('@a2ui/web_core/v0_9');
  const { shallowRef, inject } = await import('vue');
  const { VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA } = await import('../catalog');

  const MockText = defineComponent({
    props: ['node'],
    template: '<span class="mock-text">{{ node.id }}</span>',
  });
  /** Prints what a child component sees through the context. */
  const MockScoped = defineComponent({
    props: ['node'],
    setup() {
      const ctx = inject(A2UI_CONTEXT_KEY);
      return { ctx };
    },
    template: '<span class="mock-scoped">{{ ctx?.dataContextPath }}|{{ ctx?.nodeProps?.value?.text?.value }}</span>',
  });

  function setup(components: Record<string, unknown>[], data: Record<string, unknown> = {}) {
    const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
    const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    processor.processMessages([
      { version: 'v0.9', createSurface: { surfaceId: 's', catalogId: CATALOG_ID } },
      { version: 'v0.9', updateDataModel: { surfaceId: 's', path: '/', value: data } },
      { version: 'v0.9', updateComponents: { surfaceId: 's', components } } as any,
    ]);
    const surface = processor.model.getSurface('s')!;
    const resolver = new NodeResolver(surface, catalog);
    const rootProps = getValue(getValue(resolver.rootNode)!.props);
    const registry = new ComponentRegistry();
    registry.register(CATALOG_ID, 'Text', MockText);
    registry.register(CATALOG_ID, 'Card', MockText);
    registry.register(CATALOG_ID, 'Nope', MockText);
    return { processor, resolver, rootProps, registry };
  }

  const mountNode = (props: Record<string, unknown>, context: Record<string, unknown>, registry: ComponentRegistry) =>
    mount(ComponentNode, {
      props,
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: { surfaceId: 's', onAction: () => {}, ...context }, [A2UI_REGISTRY_KEY as symbol]: registry } },
    });

  it('renders a child by id from the parent node props and scopes descendants to the node', () => {
    const { processor, rootProps, registry } = setup(
      [
        { id: 'root', component: 'Column', children: { path: '/items', componentId: 'item' } },
        { id: 'item', component: 'Text', text: { path: 'label' } },
      ],
      { items: [{ label: 'one' }, { label: 'two' }] },
    );
    registry.register(CATALOG_ID, 'Text', MockScoped);
    const wrapper = mountNode({ id: 'item', path: '/items/1' }, { processor, nodeProps: shallowRef(rootProps) }, registry);
    expect(wrapper.find('.mock-scoped').text()).toBe('/items/1|two');
  });

  it('renders a placeholder for a child that has not arrived', () => {
    const { processor, rootProps, registry } = setup([{ id: 'root', component: 'Card', child: 'missing' }]);
    const wrapper = mountNode({ id: 'missing' }, { processor, nodeProps: shallowRef(rootProps) }, registry);
    expect(wrapper.text()).toContain('[pending: missing]');
    expect(wrapper.find('.mock-text').exists()).toBe(false);
  });

  it('falls back to the registry for a type the catalog does not know', () => {
    const { processor, rootProps, registry } = setup([
      { id: 'root', component: 'Card', child: 'weird' },
      { id: 'weird', component: 'Nope' },
    ]);
    const wrapper = mountNode({ id: 'weird' }, { processor, nodeProps: shallowRef(rootProps) }, registry);
    expect(wrapper.find('.mock-text').text()).toBe('weird');
  });

  it('renders the resolver root for id="root"', () => {
    const { processor, resolver, registry } = setup([{ id: 'root', component: 'Card', child: 'body' }, { id: 'body', component: 'Text', text: 'x' }]);
    const wrapper = mountNode({ id: 'root' }, { processor, resolver }, registry);
    expect(wrapper.find('.mock-text').text()).toBe('root');
  });
});
