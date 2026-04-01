import type { App, Plugin } from 'vue';
import A2UIProvider from './composables/A2UIProvider.vue';
import ComponentNode from './core/ComponentNode.vue';
import { defaultRegistry } from './core/ComponentRegistry';
import { registerDefaultComponents } from './core/defaultCatalog';

import { CATALOG_ID } from './core/constants';

export interface A2UiVueRendererOptions {
  components?: Record<string, any>;
}

export const A2UiVueRenderer: Plugin = {
  install(app: App, options?: A2UiVueRendererOptions) {
    app.component('A2uiProvider', A2UIProvider);
    app.component('A2uiComponentNode', ComponentNode);

    registerDefaultComponents();

    if (options?.components) {
      defaultRegistry.registerAll(CATALOG_ID, options.components);
    }
  },
};

export default A2UiVueRenderer;
