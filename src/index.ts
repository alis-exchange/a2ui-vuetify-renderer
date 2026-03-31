// Export the A2UI Vue Renderer Plugin
export { A2UiVueRenderer, default as plugin } from './A2UIRendererPlugin';
export type { A2UiVueRendererOptions } from './A2UIRendererPlugin';

// Export Composables
export { useA2UI, A2UI_CONTEXT_KEY } from './composables/useA2UI';
export { useDynamicProps } from './composables/useDynamicProps';
export type { A2UIContext, A2UIActionPayload } from './composables/useA2UI';
export { default as A2UIProvider } from './composables/A2UIProvider.vue';

// Export Core Components
export { default as ComponentNode } from './core/ComponentNode.vue';
export { ComponentRegistry, defaultRegistry, A2UI_REGISTRY_KEY } from './core/ComponentRegistry';

export { registerDefaultComponents } from './core/defaultCatalog';

export { getCatalogSchema } from './core/getCatalogSchema';

// Export catalog ID for consumers to reference the schema
export { CATALOG_ID } from './core/constants';
