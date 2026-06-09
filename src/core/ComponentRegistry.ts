import type { ComponentApi } from '@a2ui/web_core/v0_9';
import type { Component, InjectionKey } from 'vue';

/** Vue injection key for providing a custom {@link ComponentRegistry} to the component tree. */
export const A2UI_REGISTRY_KEY: InjectionKey<ComponentRegistry> = Symbol('A2UI_REGISTRY_KEY');

/**
 * A two-level map that associates component type names with Vue component implementations,
 * scoped by catalog ID.
 *
 * Each catalog (identified by a URL-style ID like `CATALOG_ID`) has its own set of
 * type → component mappings. This allows multiple catalogs to coexist without name collisions,
 * and lets consumers register custom components alongside the built-in ones.
 *
 * The registry also stores optional {@link ComponentApi} definitions used by
 * {@link getCatalogSchema} to include custom component schemas in the generated JSON Schema.
 *
 * @example
 * ```ts
 * import { ComponentRegistry, CATALOG_ID } from '@alis-build/a2ui-vuetify-renderer';
 *
 * const registry = new ComponentRegistry();
 * registry.register(CATALOG_ID, 'CustomChart', MyChartComponent, MyChartApi);
 *
 * // Look up a component at render time
 * const component = registry.get(CATALOG_ID, 'CustomChart');
 * ```
 */
export class ComponentRegistry {
  private catalogs: Map<string, Map<string, Component>> = new Map();
  private apis: Map<string, Map<string, ComponentApi>> = new Map();

  /**
   * Registers a single component under the given catalog.
   *
   * @param catalogId - The catalog to register under (typically {@link CATALOG_ID}).
   * @param type - The component type name as used in the A2UI surface model (e.g. `"Button"`).
   * @param component - The Vue component to render for this type.
   * @param api - Optional Zod-based API definition for JSON Schema generation.
   */
  register(catalogId: string, type: string, component: Component, api?: ComponentApi) {
    if (!this.catalogs.has(catalogId)) {
      this.catalogs.set(catalogId, new Map());
      this.apis.set(catalogId, new Map());
    }
    this.catalogs.get(catalogId)!.set(type, component);
    if (api) {
      this.apis.get(catalogId)!.set(type, api);
    }
  }

  /**
   * Registers multiple components at once under the given catalog.
   *
   * @param catalogId - The catalog to register under.
   * @param components - A record of type name → Vue component pairs.
   * @param apis - Optional record of type name → ComponentApi pairs.
   *
   * @example
   * ```ts
   * registry.registerAll(CATALOG_ID, {
   *   CustomButton: MyButton,
   *   CustomChart: MyChart,
   * });
   * ```
   */
  registerAll(catalogId: string, components: Record<string, Component>, apis?: Record<string, ComponentApi>) {
    if (!this.catalogs.has(catalogId)) {
      this.catalogs.set(catalogId, new Map());
      this.apis.set(catalogId, new Map());
    }
    const catalog = this.catalogs.get(catalogId)!;
    for (const [type, component] of Object.entries(components)) {
      catalog.set(type, component);
    }

    if (apis) {
      const apiCatalog = this.apis.get(catalogId)!;
      for (const [type, api] of Object.entries(apis)) {
        apiCatalog.set(type, api);
      }
    }
  }

  /**
   * Looks up the Vue component registered for a given type in the specified catalog.
   *
   * @param catalogId - The catalog to search.
   * @param type - The component type name.
   * @returns The registered Vue component, or `undefined` if not found.
   */
  get(catalogId: string, type: string): Component | undefined {
    return this.catalogs.get(catalogId)?.get(type);
  }

  /**
   * Looks up the {@link ComponentApi} definition for a given type.
   *
   * @param catalogId - The catalog to search.
   * @param type - The component type name.
   * @returns The API definition, or `undefined` if not registered.
   */
  getApi(catalogId: string, type: string): ComponentApi | undefined {
    return this.apis.get(catalogId)?.get(type);
  }

  /**
   * Checks whether a component type is registered in the specified catalog.
   *
   * @param catalogId - The catalog to check.
   * @param type - The component type name.
   */
  has(catalogId: string, type: string): boolean {
    return this.catalogs.get(catalogId)?.has(type) ?? false;
  }

  /**
   * Returns all registered component type names for a catalog.
   *
   * @param catalogId - The catalog whose keys to list.
   * @returns An array of type name strings, or an empty array if the catalog doesn't exist.
   */
  keys(catalogId: string): string[] {
    const catalog = this.catalogs.get(catalogId);
    return catalog ? Array.from(catalog.keys()) : [];
  }
}

/**
 * The shared, application-wide component registry instance.
 *
 * Pre-populated with all built-in Vuetify components when the
 * {@link A2UiVueRenderer} plugin is installed. Custom components
 * registered via plugin options or `registry.register()` are added here.
 */
export const defaultRegistry = new ComponentRegistry();
