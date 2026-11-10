import { Catalog, MessageProcessor } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { createVuetify } from 'vuetify';
import { A2UIProvider, CATALOG_ID, CATALOG_ID_V1, ComponentNode, VUETIFY_COMPONENTS, VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS, VUETIFY_FUNCTIONS_V1, registerDefaultComponents } from './index';

/**
 * One surface, written once in v0.9 shape and sent as v0.9, v0.9.1 and v1.0 messages. The same
 * Vuetify components must behave the same way for each.
 */
type Wire = 'v0.9' | 'v0.9.1' | '1.0';

/** Rewrites v0.9 binding and call keys into v1.0's `@` form, leaving ChildList templates alone. */
function toV1(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toV1);
  if (value === null || typeof value !== 'object') return value;
  const rec = value as Record<string, unknown>;
  if ('componentId' in rec) return rec;
  return Object.fromEntries(Object.entries(rec).map(([k, v]) => [k === 'path' ? '@path' : k === 'call' ? '@call' : k, toV1(v)]));
}

const COMPONENTS = [
  { id: 'root', component: 'Column', children: ['greeting', 'name', 'rows', 'send', 'docs'] },
  { id: 'greeting', component: 'Text', text: { path: '/name' } },
  { id: 'name', component: 'TextField', label: 'Name', value: { path: '/name' }, checks: [{ condition: { call: 'required', args: { value: { path: '/name' } } }, message: 'Name is required' }] },
  { id: 'rows', component: 'Column', children: { componentId: 'row', path: '/rows' } },
  { id: 'row', component: 'TextField', label: 'Row', value: { path: 'label' } },
  { id: 'send', component: 'Button', label: 'Send', action: { event: { name: 'send' } }, checks: [{ condition: { call: 'required', args: { value: { path: '/name' } } }, message: 'Name is required' }] },
  { id: 'docs', component: 'Button', label: 'Docs', action: { functionCall: { call: 'openUrl', args: { url: 'https://example.com/docs' } } } },
];
const DATA = { name: 'Ada', rows: [{ label: 'first' }, { label: 'second' }] };

function messages(surfaceId: string, wire: Wire) {
  const v1 = wire === '1.0';
  const catalogId = v1 ? CATALOG_ID_V1 : CATALOG_ID;
  const components = v1 ? toV1(COMPONENTS) : COMPONENTS;
  return [
    { version: wire, createSurface: { surfaceId, catalogId } },
    { version: wire, updateDataModel: { surfaceId, path: '/', value: structuredClone(DATA) } },
    { version: wire, updateComponents: { surfaceId, components } },
  ];
}

function bothCatalogs() {
  return [new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS), new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS_V1)];
}

function render(processor: MessageProcessor, surfaceId: string) {
  return mount(A2UIProvider, {
    global: { plugins: [createVuetify()] },
    props: { processor, surfaceId, onAction: vi.fn(), onError: vi.fn() },
    slots: { default: () => h(ComponentNode, { id: 'root' }) },
  });
}

describe.each<Wire>(['v0.9', 'v0.9.1', '1.0'])('the same surface sent as %s', (wire) => {
  beforeAll(() => registerDefaultComponents());
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (navigator as { userActivation?: unknown }).userActivation;
  });

  const setup = () => {
    const processor = new MessageProcessor(bothCatalogs(), undefined, { version: 'v0.9' });
    processor.processMessages(messages('s', wire) as never);
    return { processor, data: processor.model.getSurface('s')!.dataModel, wrapper: render(processor, 's') };
  };

  it('renders bound text and a template list', () => {
    const { wrapper } = setup();
    expect(wrapper.findAllComponents({ name: 'A2UIText' })[0].text()).toBe('Ada');
    expect(wrapper.findAllComponents({ name: 'VTextField' }).map((f) => f.props('modelValue'))).toEqual(['Ada', 'first', 'second']);
  });

  it('writes typing back, at the top level and inside a row', async () => {
    const { wrapper, data } = setup();
    const fields = wrapper.findAllComponents({ name: 'VTextField' });
    await fields[0].vm.$emit('update:modelValue', 'Grace');
    await fields[2].vm.$emit('update:modelValue', 'changed');
    await nextTick();
    expect(data.get('/name')).toBe('Grace');
    expect(data.get('/rows/1/label')).toBe('changed');
    expect(wrapper.findAllComponents({ name: 'A2UIText' })[0].text()).toBe('Grace');
  });

  it('gates the Button on its checks', async () => {
    const { wrapper, data } = setup();
    data.set('/name', '');
    await nextTick();
    expect(wrapper.findAllComponents({ name: 'VBtn' })[0].props('disabled')).toBe(true);
    data.set('/name', 'Ada');
    await nextTick();
    expect(wrapper.findAllComponents({ name: 'VBtn' })[0].props('disabled')).toBe(false);
  });

  it('opens a link only from a click', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    Object.defineProperty(navigator, 'userActivation', { value: { isActive: true, hasBeenActive: true }, configurable: true });
    const { wrapper } = setup();
    await wrapper.findAllComponents({ name: 'VBtn' })[1].trigger('click');
    await nextTick();
    expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');
  });
});

describe('one processor, both versions', () => {
  beforeAll(() => registerDefaultComponents());

  it('serves a v0.9 surface and a v1.0 surface side by side', () => {
    const processor = new MessageProcessor(bothCatalogs(), undefined, { version: 'v0.9' });
    processor.processMessages([...messages('old', 'v0.9'), ...messages('new', '1.0')] as never);
    expect(render(processor, 'old').findAllComponents({ name: 'VTextField' }).length).toBe(3);
    expect(render(processor, 'new').findAllComponents({ name: 'VTextField' }).length).toBe(3);
  });
});
