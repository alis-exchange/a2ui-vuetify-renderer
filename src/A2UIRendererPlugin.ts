import type { App, Plugin } from 'vue';
import A2UIProvider from './composables/A2UIProvider.vue';
import ComponentNode from './core/ComponentNode.vue';
import { A2UI_REGISTRY_KEY, defaultRegistry, type ComponentRegistry } from './core/ComponentRegistry';
import { registerDefaultComponents } from './core/defaultCatalog';

import { CATALOG_ID } from './core/constants';

/**
 * Options for the {@link A2UiVueRenderer} plugin.
 */
export interface A2UiVueRendererOptions {
  /**
   * Additional Vue components to register in the default catalog alongside
   * the built-in Vuetify components. Keys are component type names (e.g. `"CustomButton"`)
   * and values are Vue component definitions.
   *
   * @example
   * ```ts
   * app.use(A2UiVueRenderer, {
   *   components: {
   *     CustomButton: MyButton,
   *     CustomChart: MyChart,
   *   },
   * });
   * ```
   */
  components?: Record<string, any>;
  /**
   * A registry for this app instead of the shared {@link defaultRegistry}. The plugin fills it
   * with the built-in components and `components`, and provides it under `A2UI_REGISTRY_KEY`, so
   * two Vue apps on one page do not see each other's custom components.
   */
  registry?: ComponentRegistry;
}

/**
 * Vue plugin that bootstraps the A2UI Vuetify renderer.
 *
 * Installs two global components (`A2uiProvider` and `A2uiComponentNode`),
 * registers all built-in Vuetify component mappings, and optionally registers
 * any custom components passed via {@link A2UiVueRendererOptions.components}.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { A2UiVueRenderer } from '@alis-build/a2ui-vuetify-renderer';
 *
 * const app = createApp(App);
 * app.use(A2UiVueRenderer, {
 *   components: { CustomButton: MyButton },
 * });
 * ```
 */
export const A2UiVueRenderer: Plugin = {
  install(app: App, options?: A2UiVueRendererOptions) {
    app.component('A2uiProvider', A2UIProvider);
    app.component('A2uiComponentNode', ComponentNode);

    const registry = options?.registry ?? defaultRegistry;
    registerDefaultComponents(registry);

    if (options?.components) {
      registry.registerAll(CATALOG_ID, options.components);
    }
    // ComponentNode falls back to defaultRegistry on its own; only an app registry needs providing.
    if (options?.registry) {
      app.provide(A2UI_REGISTRY_KEY, options.registry);
    }
  },
};

export default A2UiVueRenderer;
