import { Catalog, MessageProcessor, NodeResolver, createFunctionImplementation, getValue, type A2uiMessage } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { createVuetify } from 'vuetify';
import { z } from 'zod';
import { A2UIProvider, CATALOG_ID, CATALOG_ID_V1, ComponentNode, VUETIFY_COMPONENTS, VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS, VUETIFY_FUNCTIONS_V1, VUETIFY_THEME_SCHEMA, registerDefaultComponents } from './index';

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

describe('openUrl needs a user click', () => {
  beforeAll(() => registerDefaultComponents());

  const URL_SURFACE = 'open-url';

  function mountWith(components: Record<string, unknown>[]) {
    const catalog = new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
    const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    processor.processMessages([{ version: 'v0.9', createSurface: { surfaceId: URL_SURFACE, catalogId: CATALOG_ID } }, { version: 'v0.9', updateComponents: { surfaceId: URL_SURFACE, components } } as A2uiMessage]);
    const onError = vi.fn();
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: URL_SURFACE, onAction: vi.fn(), onError },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    return { wrapper, onError };
  }

  const linkButton = (url: string) => [
    { id: 'root', component: 'Column', children: ['open'] },
    { id: 'open', component: 'Button', label: 'Open', action: { functionCall: { call: 'openUrl', args: { url } } } },
  ];

  let open: ReturnType<typeof vi.fn>;
  let assign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    open = vi.fn();
    assign = vi.fn();
    vi.stubGlobal('open', open);
    vi.stubGlobal('location', { href: 'https://example.com/', assign });
  });

  // jsdom has no navigator.userActivation; web_core reads it to tell a click from a script call.
  const setUserActivation = (isActive: boolean) => Object.defineProperty(navigator, 'userActivation', { value: { isActive, hasBeenActive: isActive }, configurable: true });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (navigator as { userActivation?: unknown }).userActivation;
  });

  it('opens the URL when the user clicks a Button', async () => {
    setUserActivation(true);
    const { wrapper } = mountWith(linkButton('https://example.com/docs'));
    await wrapper.findComponent({ name: 'VBtn' }).trigger('click');
    await nextTick();
    expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');
  });

  it('does nothing when the browser reports no user gesture', async () => {
    setUserActivation(false);
    const { wrapper, onError } = mountWith(linkButton('tel:+27110000000'));
    await wrapper.findComponent({ name: 'VBtn' }).trigger('click');
    await nextTick();
    expect(assign).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/requires user activation/) }));
  });

  it.each([
    ['v0.9', { call: 'openUrl', args: { url: 'mailto:hi@example.com' } }],
    ['v1.0', { '@call': 'openUrl', args: { url: 'mailto:hi@example.com' } }],
  ])('refuses a %s check condition that would open a link while the user types', async (version, condition) => {
    // A keystroke counts as a user gesture, so only passive evaluation keeps a check from firing it.
    setUserActivation(true);
    const v1 = version === 'v1.0';
    const processor = v1
      ? new MessageProcessor([new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS_V1)])
      : new MessageProcessor([new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS)], undefined, { version: 'v0.9' });
    const wire = v1 ? '1.0' : 'v0.9';
    processor.processMessages([
      { version: wire, createSurface: { surfaceId: 'chk', catalogId: v1 ? CATALOG_ID_V1 : CATALOG_ID } },
      { version: wire, updateComponents: { surfaceId: 'chk', components: [{ id: 'root', component: 'TextField', label: 'L', checks: [{ condition, message: 'm' }] }] } },
    ] as never);
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: 'chk', onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    const rules = wrapper.findComponent({ name: 'VTextField' }).props('rules') as ((v: unknown) => unknown)[];
    rules[0]('a');
    rules[0]('ab');
    expect(assign).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('refuses a binding that would open a link while rendering', async () => {
    const { onError } = mountWith([
      { id: 'root', component: 'Column', children: ['t'] },
      { id: 't', component: 'Text', text: { call: 'openUrl', args: { url: 'mailto:hi@example.com' } } },
    ]);
    await nextTick();
    expect(assign).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/requires user activation/) }));
  });
});

describe('select-style inputs bind to the data model', () => {
  beforeAll(() => registerDefaultComponents());

  const SELECT_SURFACE = 'selects';

  it.each([
    ['Select', 'VSelect'],
    ['Autocomplete', 'VAutocomplete'],
    ['Combobox', 'VCombobox'],
    ['ChoicePicker', 'VSelect'],
  ])('%s accepts { path } and writes the choice back', async (type, vuetifyName) => {
    const catalog = new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
    const processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    // Before web_core could see these as bindable, MessageProcessor rejected the { path } value outright.
    processor.processMessages([
      { version: 'v0.9', createSurface: { surfaceId: SELECT_SURFACE, catalogId: CATALOG_ID } },
      { version: 'v0.9', updateDataModel: { surfaceId: SELECT_SURFACE, path: '/', value: { choice: 'a' } } },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: SELECT_SURFACE,
          components: [
            { id: 'root', component: 'Column', children: ['pick', 'echo'] },
            { id: 'pick', component: type, options: ['a', 'b'], value: { path: '/choice' } },
            { id: 'echo', component: 'Text', text: { path: '/choice' } },
          ],
        },
      } as A2uiMessage,
    ]);
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: SELECT_SURFACE, onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });

    const echo = () => wrapper.findComponent({ name: 'A2UIText' }).text();
    const input = wrapper.findComponent({ name: vuetifyName });
    expect(input.props('modelValue')).toBe('a');
    expect(echo()).toBe('a');

    await input.vm.$emit('update:modelValue', 'b');
    await nextTick();
    expect(processor.model.getSurface(SELECT_SURFACE)!.dataModel.get('/choice')).toBe('b');
    expect(echo()).toBe('b');
  });
});

describe('component lookup by catalog', () => {
  beforeAll(() => registerDefaultComponents());

  const render = (processor: MessageProcessor, surfaceId: string) =>
    mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId, onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });

  it('renders a v1.0 surface with the same Vuetify components', () => {
    const processor = new MessageProcessor([new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, [])]);
    processor.processMessages([
      { version: '1.0', createSurface: { surfaceId: 'v1', catalogId: CATALOG_ID_V1, dataModel: { name: 'Ada', items: [{ label: 'first' }, { label: 'second' }] } } },
      {
        version: '1.0',
        updateComponents: {
          surfaceId: 'v1',
          components: [
            { id: 'root', component: 'Column', children: ['greeting', 'list'] },
            { id: 'greeting', component: 'Text', text: { '@path': '/name' } },
            { id: 'list', component: 'Column', children: { componentId: 'item', path: '/items' } },
            { id: 'item', component: 'Text', text: { '@path': 'label' } },
          ],
        },
      },
    ] as never);
    const text = render(processor, 'v1').text();
    expect(text).toContain('Ada');
    expect(text).toContain('first');
    expect(text).toContain('second');
  });

  it('still renders a v0.9 surface whose host named its catalog something else', () => {
    const processor = new MessageProcessor([new Catalog('my-own-catalog', '0.9', VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS)], undefined, { version: 'v0.9' });
    processor.processMessages([
      { version: 'v0.9', createSurface: { surfaceId: 'own', catalogId: 'my-own-catalog' } },
      { version: 'v0.9', updateComponents: { surfaceId: 'own', components: [{ id: 'root', component: 'Text', text: 'hello' }] } } as A2uiMessage,
    ]);
    expect(render(processor, 'own').text()).toContain('hello');
  });
});

describe('two-way binding through useBinding', () => {
  beforeAll(() => registerDefaultComponents());

  type Version = 'v0.9' | 'v1.0';
  const bind = (version: Version, path: string) => (version === 'v1.0' ? { '@path': path } : { path });

  function surfaceWith(version: Version, components: Record<string, unknown>[], nodeResolver = true) {
    const v1 = version === 'v1.0';
    const catalog = v1 ? new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, []) : new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS);
    const processor = v1 ? new MessageProcessor([catalog]) : new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    const wire = v1 ? '1.0' : 'v0.9';
    const catalogId = v1 ? CATALOG_ID_V1 : CATALOG_ID;
    processor.processMessages([
      { version: wire, createSurface: { surfaceId: 'b', catalogId } },
      { version: wire, updateDataModel: { surfaceId: 'b', path: '/', value: { name: 'Ada', rows: [{ name: 'first' }, { name: 'second' }] } } },
      { version: wire, updateComponents: { surfaceId: 'b', components } },
    ] as never);
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: 'b', onAction: vi.fn(), onError: vi.fn(), nodeResolver },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    return { wrapper, data: processor.model.getSurface('b')!.dataModel };
  }

  it.each<Version>(['v0.9', 'v1.0'])('%s: a top-level TextField writes to its absolute path', async (version) => {
    const { wrapper, data } = surfaceWith(version, [
      { id: 'root', component: 'Column', children: ['tf'] },
      { id: 'tf', component: 'TextField', label: 'Name', value: bind(version, '/name') },
    ]);
    await wrapper.findComponent({ name: 'VTextField' }).vm.$emit('update:modelValue', 'Grace');
    expect(data.get('/name')).toBe('Grace');
  });

  it.each<Version>(['v0.9', 'v1.0'])('%s: a TextField in a template row writes to that row', async (version) => {
    const { wrapper, data } = surfaceWith(version, [
      { id: 'root', component: 'Column', children: { componentId: 'row', path: '/rows' } },
      { id: 'row', component: 'TextField', label: 'Row', value: bind(version, 'name') },
    ]);
    const fields = wrapper.findAllComponents({ name: 'VTextField' });
    expect(fields.map((f) => f.props('modelValue'))).toEqual(['first', 'second']);
    await fields[1].vm.$emit('update:modelValue', 'changed');
    expect(data.get('/rows/1/name')).toBe('changed');
    expect(data.get('/rows/0/name')).toBe('first');
    expect(data.get('/name')).toBe('Ada');
  });

  it('v0.9 legacy render path still writes', async () => {
    const { wrapper, data } = surfaceWith(
      'v0.9',
      [
        { id: 'root', component: 'Column', children: ['tf'] },
        { id: 'tf', component: 'TextField', label: 'Name', value: { path: '/name' } },
      ],
      false,
    );
    await wrapper.findComponent({ name: 'VTextField' }).vm.$emit('update:modelValue', 'Legacy');
    expect(data.get('/name')).toBe('Legacy');
  });
});

describe('v1.0 check results', () => {
  beforeAll(() => registerDefaultComponents());

  it('agree between Vuetify rules and the binder, for errors and warnings', async () => {
    const processor = new MessageProcessor([new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, [])]);
    const check = { condition: { '@path': '/emailCheck' }, message: 'Enter an email' };
    processor.processMessages([
      { version: '1.0', createSurface: { surfaceId: 'c', catalogId: CATALOG_ID_V1, dataModel: { email: 'x', emailCheck: { valid: false, message: 'Domain is blocked' } } } },
      {
        version: '1.0',
        updateComponents: {
          surfaceId: 'c',
          components: [
            { id: 'root', component: 'Column', children: ['tf', 'send'] },
            { id: 'tf', component: 'TextField', label: 'Email', value: { '@path': '/email' }, checks: [check] },
            { id: 'send', component: 'Button', label: 'Send', action: { event: { name: 'send' } }, checks: [check] },
          ],
        },
      },
    ] as never);
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: 'c', onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    const rule = () => (wrapper.findComponent({ name: 'VTextField' }).props('rules') as ((v: unknown) => unknown)[])[0]('x');

    expect(rule()).toBe('Domain is blocked');
    expect(wrapper.findComponent({ name: 'VBtn' }).props('disabled')).toBe(true);

    processor.model.getSurface('c')!.dataModel.set('/emailCheck', { valid: false, message: 'Unusual domain', severity: 'warning' });
    await nextTick();
    expect(rule()).toBe(true);
    expect(wrapper.findComponent({ name: 'VBtn' }).props('disabled')).toBe(false);
  });
});

describe('v1.0 surface with the Vuetify v1.0 functions', () => {
  beforeAll(() => registerDefaultComponents());
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (navigator as { userActivation?: unknown }).userActivation;
  });

  it('runs @call checks and opens a link from a clicked Button', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    Object.defineProperty(navigator, 'userActivation', { value: { isActive: true, hasBeenActive: true }, configurable: true });
    const processor = new MessageProcessor([new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS_V1)]);
    processor.processMessages([
      { version: '1.0', createSurface: { surfaceId: 'f', catalogId: CATALOG_ID_V1, dataModel: { name: '' } } },
      {
        version: '1.0',
        updateComponents: {
          surfaceId: 'f',
          components: [
            { id: 'root', component: 'Column', children: ['tf', 'docs'] },
            { id: 'tf', component: 'TextField', label: 'Name', value: { '@path': '/name' }, checks: [{ condition: { '@call': 'required', args: { value: { '@path': '/name' } } }, message: 'Name is required' }] },
            { id: 'docs', component: 'Button', label: 'Docs', action: { functionCall: { '@call': 'openUrl', args: { url: 'https://example.com/docs' } } } },
          ],
        },
      },
    ] as never);
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: 'f', onAction: vi.fn(), onError: vi.fn() },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    const rule = () => (wrapper.findComponent({ name: 'VTextField' }).props('rules') as ((v: unknown) => unknown)[])[0]('');
    expect(rule()).toBe('Name is required');
    processor.model.getSurface('f')!.dataModel.set('/name', 'Ada');
    await nextTick();
    expect(rule()).toBe(true);

    await wrapper.findComponent({ name: 'VBtn' }).trigger('click');
    await nextTick();
    expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');
  });
});

describe('v1.0 provider behaviour', () => {
  beforeAll(() => registerDefaultComponents());

  function v1Surface(create: Record<string, unknown>, components: Record<string, unknown>[], nodeResolver = true) {
    const processor = new MessageProcessor([new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS_V1)]);
    processor.processMessages([
      { version: '1.0', createSurface: { surfaceId: 'p', dataModel: { name: 'Ada' }, ...create } },
      { version: '1.0', updateComponents: { surfaceId: 'p', components } },
    ] as never);
    const onError = vi.fn();
    const wrapper = mount(A2UIProvider, {
      global: { plugins: [createVuetify()] },
      props: { processor, surfaceId: 'p', onAction: vi.fn(), onError, nodeResolver },
      slots: { default: () => h(ComponentNode, { id: 'root' }) },
    });
    return { wrapper, onError, processor };
  }

  it('reports a v0.9-style binding once instead of rendering it silently', async () => {
    const { wrapper, onError } = v1Surface({ catalogId: CATALOG_ID_V1 }, [
      { id: 'root', component: 'Column', children: ['old'] },
      { id: 'old', component: 'Text', text: { path: '/name' } },
    ]);
    await nextTick();
    wrapper.vm.$forceUpdate();
    await nextTick();
    const reports = onError.mock.calls.filter(([e]) => e?.code === 'VALIDATION_FAILED');
    expect(reports).toHaveLength(1);
    expect(reports[0][0]).toMatchObject({ path: '/text', details: { componentId: 'old' } });
  });

  it('reports v0.9 syntax that arrives in an update to an existing component', async () => {
    const { onError, processor } = v1Surface({ catalogId: CATALOG_ID_V1 }, [{ id: 'root', component: 'Text', text: { '@path': '/name' } }]);
    await nextTick();
    expect(onError.mock.calls.filter(([e]) => e?.code === 'VALIDATION_FAILED')).toHaveLength(0);

    // Same id and type: web_core updates the ComponentModel in place.
    processor.processMessages([{ version: '1.0', updateComponents: { surfaceId: 'p', components: [{ id: 'root', component: 'Text', text: { path: '/name' } }] } }] as never);
    await nextTick();
    await nextTick();
    const reports = onError.mock.calls.filter(([e]) => e?.code === 'VALIDATION_FAILED');
    expect(reports).toHaveLength(1);
    expect(reports[0][0]).toMatchObject({ path: '/text', details: { componentId: 'root' } });
  });

  it('renders from the node tree even with nodeResolver: false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { wrapper } = v1Surface({ catalogId: CATALOG_ID_V1 }, [{ id: 'root', component: 'Text', text: { '@path': '/name' } }], false);
    expect(wrapper.text()).toContain('Ada');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('legacy render path'));
    warn.mockRestore();
  });

  it('renders a surface with no default catalog, where each component names its own', () => {
    const { wrapper } = v1Surface({}, [
      { id: 'root', component: 'Column', catalogId: CATALOG_ID_V1, children: ['t'] },
      { id: 't', component: 'Text', catalogId: CATALOG_ID_V1, text: { '@path': '/name' } },
    ]);
    expect(wrapper.text()).toContain('Ada');
  });
});
