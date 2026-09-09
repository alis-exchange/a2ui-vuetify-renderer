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

  // web_core's EventEmitter.emit awaits each listener, so a host subscribed to onSurfaceDeleted
  // ahead of the provider pushes the provider's delete handling into a microtask, while its
  // create handling (where it is still the first listener) runs inline. The delete event is
  // therefore stale by the time it arrives: acting on it disposes the freshly built resolver.
  it('ignores a stale deleted event for a surface that has since been recreated', async () => {
    const processor = createProcessor();
    processor.processMessages([createSurface(), setData('/', { msg: 'first' }), rootText({ path: '/msg' })]);
    // Subscribing first makes the provider the second listener, and only the first runs inline.
    processor.model.onSurfaceDeleted.subscribe(() => {});
    const wrapper = mountProvider(processor, {}, () => [h(ComponentNode, { id: 'root' }), h(ContextProbe)]);
    expect(wrapper.find('.mock-text').text()).toBe('first');

    processor.processMessages([{ version: 'v0.9', deleteSurface: { surfaceId: SURFACE } }, createSurface(), setData('/', { msg: 'second' }), rootText({ path: '/msg' })]);
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('second');

    // The real cost: the recreated surface silently stops being tracked, so nothing updates again.
    expect(seenContext?.resolver).toBeDefined();
    processor.model.getSurface(SURFACE)!.dataModel.set('/msg', 'third');
    await nextTick();
    expect(wrapper.find('.mock-text').text()).toBe('third');
  });

  // A provider that mounts from inside an earlier listener finds the surface itself (the model
  // fills its map before emitting) and is then handed the very same creation event, because
  // emit() visits listeners added mid-loop. Re-attaching would throw away the live resolver.
  it('ignores a created event for the surface it already attached while mounting', async () => {
    const processor = createProcessor();
    let wrapper: ReturnType<typeof mountProvider> | undefined;
    let resolverAtMount: unknown;
    processor.model.onSurfaceCreated.subscribe(() => {
      if (wrapper) return;
      wrapper = mountProvider(processor, {}, () => [h(ComponentNode, { id: 'root' }), h(ContextProbe)]);
      resolverAtMount = seenContext?.resolver;
    });

    processor.processMessages([createSurface(), setData('/', { msg: 'hello' }), rootText({ path: '/msg' })]);
    await nextTick();

    expect(resolverAtMount).toBeDefined();
    expect((resolverAtMount as { disposed?: boolean }).disposed).toBe(false);
    expect(seenContext?.resolver).toBe(resolverAtMount);
    expect(wrapper!.find('.mock-text').text()).toBe('hello');
  });

  // NodeResolver builds the whole tree in its constructor, so a surface web_core cannot bind
  // throws synchronously. When the surface already exists at mount that happens inside setup(),
  // which unmounts the provider subtree and renders nothing at all.
  it('reports a resolver that fails to build through onError instead of failing to mount', async () => {
    const processor = createProcessor();
    const onError = vi.fn();
    // A forbidden path segment passes message validation but throws when the binder resolves it.
    processor.processMessages([createSurface(), rootText({ path: '/constructor' })]);

    const wrapper = mountProvider(processor, { onError }, () => h(ContextProbe));

    expect(wrapper.find('.probe').exists()).toBe(true);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Forbidden path segment') }));
    // No resolver: the subtree falls back to the static path rather than taking the provider down.
    expect(seenContext?.resolver).toBeUndefined();
  });

  it('reports surface errors through onError', async () => {
    const processor = createProcessor();
    const onError = vi.fn();
    processor.processMessages([createSurface()]);
    mountProvider(processor, { onError });
    processor.processMessages([
      update([
        { id: 'root', component: 'Card', child: 'weird' },
        { id: 'weird', component: 'Nope' },
      ]),
    ]);
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

  it('warns when the processor is handed over as a Vue reactive proxy', async () => {
    const { ref } = await import('vue');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const processor = createProcessor();
    mountProvider(ref(processor).value as MessageProcessor);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('reactive proxy'));
    warn.mockRestore();
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
