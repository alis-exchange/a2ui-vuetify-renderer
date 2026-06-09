/**
 * @module @alis-build/a2ui-vuetify-renderer
 *
 * Vuetify-based renderer for the A2UI protocol.
 *
 * Install the {@link A2UiVueRenderer} plugin in your Vue app to render
 * A2UI surfaces. Use `<A2UIProvider>` to scope a surface and `<ComponentNode>`
 * to render individual components. The {@link useA2UI} composable gives
 * component authors access to data resolution, action dispatch, and data mutation.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { A2UiVueRenderer } from '@alis-build/a2ui-vuetify-renderer';
 *
 * const app = createApp(App);
 * app.use(A2UiVueRenderer);
 * ```
 */

// Plugin
export { A2UiVueRenderer, default as plugin } from './A2UIRendererPlugin';
export type { A2UiVueRendererOptions } from './A2UIRendererPlugin';

// Export Composables
export { default as A2UIProvider } from './composables/A2UIProvider.vue';
export { A2UI_CONTEXT_KEY, useA2UI } from './composables/useA2UI';
export type { A2UIActionPayload, A2UIContext, UseA2UIReturn } from './composables/useA2UI';
export { useDynamicProps } from './composables/useDynamicProps';

// Export Core Components
export { default as ComponentNode } from './core/ComponentNode.vue';
export { A2UI_REGISTRY_KEY, ComponentRegistry, defaultRegistry } from './core/ComponentRegistry';

export { registerDefaultComponents } from './core/defaultCatalog';

export { catalogFilters } from './core/catalogFilters';
export type { CatalogFilter } from './core/catalogFilters';
export { getCatalogSchema } from './core/getCatalogSchema';
export type { GetCatalogSchemaOptions } from './core/getCatalogSchema';

// Export shared types for custom component development
export type { ComponentModel } from '@a2ui/web_core/v0_9';

// Export catalog ID for consumers to reference the schema
export { CATALOG_ID } from './core/constants';

// Export Vuetify catalog ComponentApi[], FunctionImplementation[], and theme schema
export { VUETIFY_COMPONENTS } from './catalog/vuetify-components';
export { VUETIFY_FUNCTIONS } from './catalog/vuetify-functions';
export { VUETIFY_THEME_SCHEMA } from './catalog/vuetify-theme';
