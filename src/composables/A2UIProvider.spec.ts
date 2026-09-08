import { Catalog, MessageProcessor, type A2uiMessage } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, h, inject, nextTick } from 'vue';
import { createVuetify } from 'vuetify';
import { VThemeProvider } from 'vuetify/components';
import { VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA } from '../catalog';
import ComponentNode from '../core/ComponentNode.vue';
import { A2UI_REGISTRY_KEY, ComponentRegistry } from '../core/ComponentRegistry';
import { CATALOG_ID } from '../core/constants';
import A2UIProvider from './A2UIProvider.vue';
import { A2UI_CONTEXT_KEY, useA2UI, type A2UIContext } from './useA2UI';

const SURFACE = 'my-surface';

/** A minimal Text that reads its label the way real components do. */
const MockText = defineComponent({
  props: ['node'],
  setup(props) {
    const { resolveValue } = useA2UI();
    const text = computed(() => resolveValue<string>(props.node.properties.text));
    return { text };
  },
  template: '<span class="mock-text">{{ text }}</span>',
});

/** Exposes the injected context for assertions. */
let seenContext: A2UIContext | undefined;
const ContextProbe = defineComponent({
  setup() {
    const ctx = inject(A2UI_CONTEXT_KEY);
    seenContext = ctx;
    return { ctx };
  },
  template: '<span class="probe">{{ ctx?.surfaceId }}</span>',
});

function createProcessor() {
  const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
  return new MessageProcessor([catalog], undefined, { version: 'v0.9' });
}
const createSurface = (theme?: Record<string, unknown>): A2uiMessage => ({ version: 'v0.9', createSurface: { surfaceId: SURFACE, catalogId: CATALOG_ID, theme } });
const setData = (path: string, value: unknown): A2uiMessage => ({ version: 'v0.9', updateDataModel: { surfaceId: SURFACE, path, value } });
const update = (components: Record<string, unknown>[]): A2uiMessage => ({ version: 'v0.9', updateComponents: { surfaceId: SURFACE, components } }) as A2uiMessage;
const rootText = (text: unknown) => update([{ id: 'root', component: 'Text', text }]);

describe('A2UIProvider.vue', () => {
  let vuetify: ReturnType<typeof createVuetify>;
  let registry: ComponentRegistry;

  beforeEach(() => {
    vuetify = createVuetify();
    registry = new ComponentRegistry();
    registry.register(CATALOG_ID, 'Text', MockText);
    seenContext = undefined;
  });

  const mountProvider = (processor: MessageProcessor, extraProps: Record<string, unknown> = {}, slot = () => h(ComponentNode, { id: 'root' })) =>
    mount(A2UIProvider, {
      global: { plugins: [vuetify], provide: { [A2UI_REGISTRY_KEY as symbol]: registry } },
      props: { processor, surfaceId: SURFACE, ...extraProps },
      slots: { default: slot },
    });

  it('provides the surfaceId and processor to its children', () => {
    const processor = createProcessor();
    const wrapper = mountProvider(processor, {}, () => h(ContextProbe));
    expect(wrapper.find('.probe').text()).toBe(SURFACE);
    expect(seenContext?.processor).toBe(processor);
  });

  it('renders the surface once it is created and re-renders on later server messages', async () => {
    const processor = createProcessor();
    const wrapper = mountProvider(processor);
    expect(wrapper.find('.mock-text').exists()).toBe(false);

    processor.processMessages([createSurface(), setData('/', { msg: 'hello' }), rootText({ path: '/msg' })]);
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('hello');

    processor.processMessages([setData('/msg', 'bye')]);
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('bye');

    processor.processMessages([rootText('replaced')]);
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('replaced');
  });

  it('re-renders on local data model writes', async () => {
    const processor = createProcessor();
    processor.processMessages([createSurface(), setData('/', { msg: 'hello' }), rootText({ path: '/msg' })]);
    const wrapper = mountProvider(processor);
    expect(wrapper.find('.mock-text').text()).toBe('hello');

    processor.model.getSurface(SURFACE)!.dataModel.set('/msg', 'local');
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('local');
  });

  it('tears the tree down when the surface is deleted and rebuilds when it is recreated', async () => {
    const processor = createProcessor();
    processor.processMessages([createSurface(), rootText('first')]);
    const wrapper = mountProvider(processor);
    expect(wrapper.find('.mock-text').text()).toBe('first');

    processor.processMessages([{ version: 'v0.9', deleteSurface: { surfaceId: SURFACE } }]);
    await nextTick();
    expect(wrapper.find('.mock-text').exists()).toBe(false);

    processor.processMessages([createSurface(), rootText('second')]);
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('second');
  });

  it('reports surface errors through onError', async () => {
    const processor = createProcessor();
    const onError = vi.fn();
    processor.processMessages([createSurface()]);
    mountProvider(processor, { onError });
    processor.processMessages([update([{ id: 'root', component: 'Card', child: 'weird' }, { id: 'weird', component: 'Nope' }])]);
    await nextTick();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNKNOWN_COMPONENT_TYPE' }));
  });

  it('disposes the resolver on unmount', () => {
    const processor = createProcessor();
    processor.processMessages([createSurface(), rootText('x')]);
    const wrapper = mountProvider(processor, {}, () => h(ContextProbe));
    const resolver = seenContext?.resolver;
    expect(resolver).toBeDefined();
    wrapper.unmount();
    expect(resolver?.disposed).toBe(true);
  });

  it('renders statically without a resolver when nodeResolver is false', async () => {
    const processor = createProcessor();
    processor.processMessages([createSurface(), setData('/', { msg: 'hello' }), rootText({ path: '/msg' })]);
    const wrapper = mountProvider(processor, { nodeResolver: false }, () => [h(ContextProbe), h(ComponentNode, { id: 'root' })]);
    expect(seenContext?.resolver).toBeUndefined();
    expect(wrapper.find('.mock-text').text()).toBe('hello');

    processor.model.getSurface(SURFACE)!.dataModel.set('/msg', 'local');
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('hello');
  });

  it('registers a scoped theme from createSurface without mutating the global theme, and cleans it up', async () => {
    const originalPrimary = vuetify.theme.global.current.value.colors.primary;
    const processor = createProcessor();
    processor.processMessages([createSurface({ primaryColor: '#ff0000', errorColor: '#00ff00', backgroundColor: '#0000ff', surfaceColor: '#123456' })]);
    const wrapper = mountProvider(processor);
    await nextTick();

    expect(vuetify.theme.global.current.value.colors.primary).toBe(originalPrimary);
    const customTheme = vuetify.theme.themes.value[`a2ui-theme-${SURFACE}`];
    expect(customTheme).toBeDefined();
    expect(customTheme.colors.primary).toBe('#ff0000');
    expect(customTheme.colors.error).toBe('#00ff00');
    expect(customTheme.colors.background).toBe('#0000ff');
    expect(customTheme.colors.surface).toBe('#123456');
    expect(wrapper.findComponent(VThemeProvider).props('theme')).toBe(`a2ui-theme-${SURFACE}`);

    wrapper.unmount();
    expect(vuetify.theme.themes.value[`a2ui-theme-${SURFACE}`]).toBeUndefined();
  });

  it('does not register a theme when the surface has no overrides', async () => {
    const processor = createProcessor();
    processor.processMessages([createSurface()]);
    const wrapper = mountProvider(processor);
    await nextTick();
    expect(vuetify.theme.themes.value[`a2ui-theme-${SURFACE}`]).toBeUndefined();
    const themeProvider = wrapper.findComponent(VThemeProvider);
    if (themeProvider.exists()) expect(themeProvider.props('theme')).toBeUndefined();
  });
});
