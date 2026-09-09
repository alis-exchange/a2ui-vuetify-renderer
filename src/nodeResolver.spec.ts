import { Catalog, MessageProcessor, NodeResolver, createFunctionImplementation, getValue, type A2uiMessage } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { createVuetify } from 'vuetify';
import { z } from 'zod';
import { A2UIProvider, CATALOG_ID, ComponentNode, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA, registerDefaultComponents } from './index';

/**
 * End to end: real catalog, real MessageProcessor, the shipped Vuetify components, rendered
 * through the provider's NodeResolver. Guards the behaviours the node layer was adopted for.
 */
const SURFACE = 'e2e';
const required = (path: string, message: string) => ({ condition: { call: 'required', args: { value: { path } } }, message });
const update = (components: Record<string, unknown>[]): A2uiMessage => ({ version: 'v0.9', updateComponents: { surfaceId: SURFACE, components } }) as A2uiMessage;

function createSurface() {
  const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
  const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
  processor.processMessages([
    { version: 'v0.9', createSurface: { surfaceId: SURFACE, catalogId: CATALOG_ID } },
    { version: 'v0.9', updateDataModel: { surfaceId: SURFACE, path: '/', value: { userName: 'Ada', items: [{ label: 'first item' }] } } },
    update([
      { id: 'root', component: 'Column', children: ['greeting', 'name', 'submit', 'list'] },
      { id: 'greeting', component: 'Text', text: { path: '/userName' } },
      { id: 'name', component: 'TextField', label: 'Name', value: { path: '/userName' }, checks: [required('/userName', 'Name is required')] },
      { id: 'submit', component: 'Button', label: 'Submit', action: { event: { name: 'submit' } }, checks: [required('/userName', 'Name is required')] },
      { id: 'list', component: 'Column', children: { path: '/items', componentId: 'item' } },
      { id: 'item', component: 'Text', text: { path: 'label' } },
    ]),
  ]);
  const surface = processor.model.getSurface(SURFACE)!;
  const onError = vi.fn();
  const wrapper = mount(A2UIProvider, {
    global: { plugins: [createVuetify()] },
    props: { processor, surfaceId: SURFACE, onAction: vi.fn(), onError },
    slots: { default: () => h(ComponentNode, { id: 'root' }) },
  });
  return { processor, surface, wrapper, onError };
}

describe('NodeResolver rendering end to end', () => {
  beforeAll(() => registerDefaultComponents());

  it('renders the surface', () => {
    const { wrapper } = createSurface();
    expect(wrapper.text()).toContain('Ada');
    expect(wrapper.text()).toContain('first item');
    expect(wrapper.findComponent({ name: 'VTextField' }).props('modelValue')).toBe('Ada');
    expect(wrapper.findComponent({ name: 'VBtn' }).props('disabled')).toBe(false);
  });

  it('updates siblings when the user types', async () => {
    const { wrapper } = createSurface();
    await wrapper.findComponent({ name: 'VTextField' }).vm.$emit('update:modelValue', 'Zed');
    await nextTick();
    expect(wrapper.text()).toContain('Zed');
    expect(wrapper.text()).not.toContain('Ada');
  });

  it('gates the Button on its checks as the data changes', async () => {
    const { wrapper, surface } = createSurface();
    surface.dataModel.set('/userName', '');
    await nextTick();
    const btn = wrapper.findComponent({ name: 'VBtn' });
    expect(btn.props('disabled')).toBe(true);
    expect(btn.attributes('title')).toBe('Name is required');

    surface.dataModel.set('/userName', 'Grace');
    await nextTick();
    expect(wrapper.findComponent({ name: 'VBtn' }).props('disabled')).toBe(false);
  });

  it('grows a template list on a local array write', async () => {
    const { wrapper, surface } = createSurface();
    surface.dataModel.set('/items', [{ label: 'first item' }, { label: 'second item' }]);
    await nextTick();
    expect(wrapper.text()).toContain('second item');
  });

  // A template nested in a template addresses its array relatively. The child paths handed to
  // ComponentNode must be absolute, or they never match the live node's `dataPath` and the
  // subtree silently drops back to the static path with a nonsensical data scope.
  it('renders a template list whose path is relative to the enclosing template item', async () => {
    const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
    const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    processor.processMessages([
      { version: 'v0.9', createSurface: { surfaceId: SURFACE, catalogId: CATALOG_ID } },
      { version: 'v0.9', updateDataModel: { surfaceId: SURFACE, path: '/', value: { groups: [{ subItems: [{ label: 'deep-a' }] }] } } },
      update([
        { id: 'root', component: 'Column', children: { path: '/groups', componentId: 'group' } },
        { id: 'group', component: 'Column', children: { path: 'subItems', componentId: 'sub' } },
        { id: 'sub', component: 'Text', text: { path: 'label' } },
      ]),
    ]);
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: SURFACE, onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    expect(wrapper.text()).toContain('deep-a');

    processor.model.getSurface(SURFACE)!.dataModel.set('/groups/0/subItems', [{ label: 'deep-a' }, { label: 'deep-b' }]);
    await nextTick();
    expect(wrapper.text()).toContain('deep-b');
  });

  it('re-renders on server messages after the first paint', async () => {
    const { wrapper, processor } = createSurface();
    processor.processMessages([{ version: 'v0.9', updateDataModel: { surfaceId: SURFACE, path: '/userName', value: 'Linus' } }]);
    await nextTick();
    expect(wrapper.text()).toContain('Linus');

    processor.processMessages([update([{ id: 'greeting', component: 'Text', text: 'replaced greeting' }])]);
    await nextTick();
    expect(wrapper.text()).toContain('replaced greeting');
  });

  it('updates a bound TextField when the server changes its value', async () => {
    const { wrapper, processor } = createSurface();
    processor.processMessages([{ version: 'v0.9', updateDataModel: { surfaceId: SURFACE, path: '/', value: { userName: 'Jane Doe', items: [] } } }]);
    await nextTick();
    expect(wrapper.findComponent({ name: 'VTextField' }).props('modelValue')).toBe('Jane Doe');
  });

  it('shows a placeholder for a missing child and swaps it in when it arrives', async () => {
    const { wrapper, processor } = createSurface();
    processor.processMessages([update([{ id: 'root', component: 'Column', children: ['greeting', 'late'] }])]);
    await nextTick();
    expect(wrapper.text()).toContain('[pending: late]');

    processor.processMessages([update([{ id: 'late', component: 'Text', text: 'I arrived late' }])]);
    await nextTick();
    expect(wrapper.text()).toContain('I arrived late');
    expect(wrapper.text()).not.toContain('[pending: late]');
  });

  it('does not evaluate a bound function again in resolveValue once the binder has', () => {
    const calls = { count: 0 };
    const counting = createFunctionImplementation({ name: 'countCalls', returnType: 'string', schema: z.object({}) }, () => {
      calls.count++;
      return 'counted';
    });
    const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, [...VUETIFY_FUNCTIONS, counting], VUETIFY_THEME_SCHEMA);
    const build = () => {
      const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
      processor.processMessages([{ version: 'v0.9', createSurface: { surfaceId: SURFACE, catalogId: CATALOG_ID } }, update([{ id: 'root', component: 'Text', text: { call: 'countCalls', args: {} } }])]);
      return processor;
    };

    // Baseline: what web_core's binder alone costs to resolve the tree.
    const bare = new NodeResolver(build().model.getSurface(SURFACE)!, catalog);
    getValue(getValue(bare.rootNode)!.props);
    const binderOnly = calls.count;
    bare.dispose();

    calls.count = 0;
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor: build(), surfaceId: SURFACE, onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    expect(wrapper.text()).toContain('counted');
    expect(calls.count).toBe(binderOnly);
  });

  // An authored trailing slash must not leak a `//` into the emitted path: web_core reads data
  // through it, but `findLiveNode` compares against `dataPath` with `===` and would never match.
  it('renders a template list whose path carries a trailing slash', async () => {
    const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
    const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    processor.processMessages([
      { version: 'v0.9', createSurface: { surfaceId: SURFACE, catalogId: CATALOG_ID } },
      { version: 'v0.9', updateDataModel: { surfaceId: SURFACE, path: '/', value: { orders: [{ label: 'L1' }] } } },
      update([
        { id: 'root', component: 'Column', children: { path: '/orders/', componentId: 'order' } },
        { id: 'order', component: 'Text', text: { path: 'label' } },
      ]),
    ]);
    const surface = processor.model.getSurface(SURFACE)!;
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: SURFACE, onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    await nextTick();
    expect(wrapper.text()).toContain('L1');

    // The subtree must stay live, which is what a stale non-matching path silently costs.
    surface.dataModel.set('/orders/0/label', 'L2');
    await nextTick();
    expect(wrapper.text()).toContain('L2');
  });

  // Form resolved `children` with `resolveValue`, which returns a template's raw data rows; each
  // row then rendered as a "Missing node" box instead of the templated component.
  it('expands a Form template child list into one node per data row', async () => {
    const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
    const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    processor.processMessages([
      { version: 'v0.9', createSurface: { surfaceId: SURFACE, catalogId: CATALOG_ID } },
      { version: 'v0.9', updateDataModel: { surfaceId: SURFACE, path: '/', value: { rows: [{ name: 'alpha' }, { name: 'beta' }] } } },
      update([
        { id: 'root', component: 'Form', children: { path: '/rows', componentId: 'row' } },
        { id: 'row', component: 'Text', text: { path: 'name' } },
      ]),
    ]);
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: SURFACE, onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    await nextTick();
    expect(wrapper.text()).toContain('alpha');
    expect(wrapper.text()).toContain('beta');
    expect(wrapper.text()).not.toContain('Missing node');
  });

  it('reports unknown component types through onError', async () => {
    const { processor, onError } = createSurface();
    processor.processMessages([
      update([
        { id: 'root', component: 'Column', children: ['weird'] },
        { id: 'weird', component: 'Nope' },
      ]),
    ]);
    await nextTick();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNKNOWN_COMPONENT_TYPE' }));
  });
});
