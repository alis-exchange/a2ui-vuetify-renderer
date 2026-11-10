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
  { id: 'root', component: 'Column', children: ['greeting', 'name', 'rows', 'send', 'docs', 'pick'] },
  { id: 'greeting', component: 'Text', text: { path: '/name' } },
  { id: 'name', component: 'TextField', label: 'Name', value: { path: '/name' }, checks: [{ condition: { call: 'required', args: { value: { path: '/name' } } }, message: 'Name is required' }] },
  { id: 'rows', component: 'Column', children: { componentId: 'row', path: '/rows' } },
  { id: 'row', component: 'TextField', label: 'Row', value: { path: 'label' } },
  {
    id: 'send',
    component: 'Button',
    label: 'Send',
    action: { event: { name: 'send', context: { who: { path: '/name' }, source: 'form' } } },
    checks: [{ condition: { call: 'required', args: { value: { path: '/name' } } }, message: 'Name is required' }],
  },
  { id: 'docs', component: 'Button', label: 'Docs', action: { functionCall: { call: 'openUrl', args: { url: 'https://example.com/docs' } } } },
];
COMPONENTS.push({ id: 'pick', component: 'Select', options: ['a', 'b'], value: { path: '/choice' }, action: { event: { name: 'picked', context: { who: { path: '/name' } } } } } as never);
const DATA = { choice: 'a', name: 'Ada', rows: [{ label: 'first' }, { label: 'second' }] };

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

function render(processor: MessageProcessor, surfaceId: string, onAction = vi.fn()) {
  return mount(A2UIProvider, {
    global: { plugins: [createVuetify()] },
    props: { processor, surfaceId, onAction, onError: vi.fn() },
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
    const actions: Record<string, any>[] = [];
    const processor = new MessageProcessor(bothCatalogs(), (action: any) => void actions.push(action), { version: 'v0.9' });
    processor.processMessages(messages('s', wire) as never);
    return { processor, actions, data: processor.model.getSurface('s')!.dataModel, wrapper: render(processor, 's') };
  };

  it('sends an event action with its context resolved', async () => {
    const { wrapper, actions } = setup();
    await wrapper.findAllComponents({ name: 'VBtn' })[0].trigger('click');
    await nextTick();
    await Promise.resolve();
    expect(actions).toHaveLength(1);
    const sent = JSON.stringify(actions[0]);
    expect(sent).toContain('"send"');
    expect(sent).toMatch(/"who":"Ada"/);
    expect(sent).toMatch(/"source":"form"/);
  });

  it('renders bound text and a template list', () => {
    const { wrapper } = setup();
    expect(wrapper.findAllComponents({ name: 'A2UIText' })[0].text()).toBe('Ada');
    expect(wrapper.findAllComponents({ name: 'VTextField' }).map((f) => f.props('modelValue'))).toEqual(['Ada', 'first', 'second', 'a']); // the last is the Select's own text field
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

  it('writes a Select choice back and sends its change action', async () => {
    const { wrapper, actions, data } = setup();
    await wrapper.findComponent({ name: 'VSelect' }).vm.$emit('update:modelValue', 'b');
    await nextTick();
    await Promise.resolve();
    expect(data.get('/choice')).toBe('b');
    const sent = JSON.stringify(actions.at(-1));
    expect(sent).toContain('"picked"');
    expect(sent).toMatch(/"value":"b"/);
    expect(sent).toMatch(/"who":"Ada"/);
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
    expect(open).not.toHaveBeenCalled();
    await wrapper.findAllComponents({ name: 'VBtn' })[1].trigger('click');
    await nextTick();
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');
  });
});

describe('one processor, both versions', () => {
  beforeAll(() => registerDefaultComponents());

  it('serves a v0.9 surface and a v1.0 surface side by side', () => {
    const processor = new MessageProcessor(bothCatalogs(), undefined, { version: 'v0.9' });
    processor.processMessages([...messages('old', 'v0.9'), ...messages('new', '1.0')] as never);
    expect(render(processor, 'old').findAllComponents({ name: 'VTextField' }).length).toBe(4);
    expect(render(processor, 'new').findAllComponents({ name: 'VTextField' }).length).toBe(4);
  });
});

describe('every two-way input writes back on v1.0', () => {
  beforeAll(() => registerDefaultComponents());

  // [component, extra props, Vuetify component that emits the change, value to emit]
  const INPUTS: [string, Record<string, unknown>, string, unknown][] = [
    ['TextField', { label: 'L' }, 'VTextField', 'typed'],
    ['TextArea', { label: 'L' }, 'VTextarea', 'typed'],
    ['NumberInput', { label: 'L' }, 'VTextField', 7],
    ['Checkbox', { label: 'L' }, 'VCheckbox', true],
    ['Slider', { min: 0, max: 10 }, 'VSlider', 3],
    ['RangeSlider', { max: 10 }, 'VRangeSlider', [2, 5]],
    ['Rating', {}, 'VRating', 4],
    ['Select', { options: ['a', 'b'] }, 'VSelect', 'b'],
    ['Autocomplete', { options: ['a', 'b'] }, 'VAutocomplete', 'b'],
    ['Combobox', { options: ['a', 'b'] }, 'VCombobox', 'b'],
    [
      'RadioButton',
      {
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
      'VRadioGroup',
      'b',
    ],
    ['DatePicker', {}, 'VDatePicker', '2026-11-10'],
    ['TimePicker', {}, 'VTextField', '10:30'],
    // Calendar writes when a date is clicked rather than on update:modelValue.
    ['Calendar', { events: [] }, 'VCalendar', '2026-11-10'],
    ['FileInput', { label: 'L' }, 'VFileInput', ['file.txt']],
  ];

  it.each(INPUTS)('%s', async (type, extra, vuetifyName, next) => {
    const processor = new MessageProcessor([new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, VUETIFY_FUNCTIONS_V1)]);
    processor.processMessages([
      { version: '1.0', createSurface: { surfaceId: 'w', catalogId: CATALOG_ID_V1, dataModel: {} } },
      { version: '1.0', updateComponents: { surfaceId: 'w', components: [{ id: 'root', component: type, ...extra, value: { '@path': '/v' } }] } },
    ] as never);
    const wrapper = render(processor, 'w');
    const input = wrapper.findComponent({ name: vuetifyName });
    expect(input.exists(), `${type} renders ${vuetifyName}`).toBe(true);
    if (type === 'Calendar') await input.vm.$emit('click:date', new Event('click'), { date: next });
    else await input.vm.$emit('update:modelValue', next);
    await nextTick();
    expect(processor.model.getSurface('w')!.dataModel.get('/v')).toEqual(next);
  });
});

describe.each<Wire>(['v0.9', '1.0'])('ChoicePicker segmented on %s', (wire) => {
  beforeAll(() => registerDefaultComponents());

  const setup = (variant: string, value: unknown, displayStyle = 'segmented') => {
    const actions: Record<string, any>[] = [];
    const processor = new MessageProcessor(bothCatalogs(), (action: any) => void actions.push(action), { version: 'v0.9' });
    const v1 = wire === '1.0';
    const picker = {
      id: 'root',
      component: 'ChoicePicker',
      label: 'Size',
      displayStyle,
      variant,
      options: [
        { label: 'Small', value: 's' },
        { label: 'Large', value: 'l' },
      ],
      value: { path: '/size' },
      action: { event: { name: 'sized', context: { source: 'picker' } } },
    };
    processor.processMessages([
      { version: wire, createSurface: { surfaceId: 'seg', catalogId: v1 ? CATALOG_ID_V1 : CATALOG_ID } },
      { version: wire, updateDataModel: { surfaceId: 'seg', path: '/', value: { size: value } } },
      { version: wire, updateComponents: { surfaceId: 'seg', components: [v1 ? toV1(picker) : picker] } },
    ] as never);
    return { actions, data: processor.model.getSurface('seg')!.dataModel, wrapper: render(processor, 'seg') };
  };

  it('renders a button per option and writes a single choice back', async () => {
    const { wrapper, data } = setup('mutuallyExclusive', 's');
    const buttons = wrapper.findComponent({ name: 'VBtnToggle' }).findAllComponents({ name: 'VBtn' });
    expect(buttons.map((b) => b.text())).toEqual(['Small', 'Large']);
    expect(wrapper.text()).toContain('Size');

    await buttons[1].trigger('click');
    await nextTick();
    await Promise.resolve();
    expect(data.get('/size')).toBe('l');
  });

  it.each([
    ['segmented', 'VBtnToggle'],
    ['dropdown', 'VSelect'],
    ['list', 'VRadioGroup'],
  ])('sends its action with the new value (%s)', async (displayStyle, vuetifyName) => {
    const { wrapper, actions } = setup('mutuallyExclusive', 's', displayStyle);
    await wrapper.findComponent({ name: vuetifyName }).vm.$emit('update:modelValue', 'l');
    await nextTick();
    await Promise.resolve();
    const sent = JSON.stringify(actions.at(-1));
    expect(sent).toContain('"sized"');
    expect(sent).toMatch(/"value":"l"/);
    expect(sent).toMatch(/"source":"picker"/);
  });

  it('stores several choices as an array with multipleSelection', async () => {
    const { wrapper, data } = setup('multipleSelection', ['s']);
    const buttons = wrapper.findComponent({ name: 'VBtnToggle' }).findAllComponents({ name: 'VBtn' });
    await buttons[1].trigger('click');
    await nextTick();
    expect(data.get('/size')).toEqual(['s', 'l']);
  });
});

describe.each<Wire>(['v0.9', '1.0'])('dropdown choice inputs on %s', (wire) => {
  beforeAll(() => registerDefaultComponents());

  it.each([
    ['Select', 'VSelect'],
    ['Autocomplete', 'VAutocomplete'],
    ['Combobox', 'VCombobox'],
  ])('%s accepts checks and shows the failing message', (type, vuetifyName) => {
    const v1 = wire === '1.0';
    const input = {
      id: 'root',
      component: type,
      options: ['a', 'b'],
      value: { path: '/choice' },
      checks: [{ condition: { call: 'required', args: { value: { path: '/choice' } } }, message: 'Pick one' }],
    };
    const processor = new MessageProcessor(bothCatalogs(), undefined, { version: 'v0.9' });
    processor.processMessages([
      { version: wire, createSurface: { surfaceId: 'dd', catalogId: v1 ? CATALOG_ID_V1 : CATALOG_ID } },
      { version: wire, updateDataModel: { surfaceId: 'dd', path: '/', value: { choice: '' } } },
      { version: wire, updateComponents: { surfaceId: 'dd', components: [v1 ? toV1(input) : input] } },
    ] as never);
    const rules = render(processor, 'dd').findComponent({ name: vuetifyName }).props('rules') as ((v: unknown) => unknown)[];
    expect(rules[0]('')).toBe('Pick one');
  });
});
