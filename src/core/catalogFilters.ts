import baseCatalog from '../../catalog/vuetify-catalog.json';

export type CatalogFilter = (componentName: string) => boolean;

const baseComponentKeys = new Set(Object.keys(baseCatalog.components));

/**
 * Pre-built filter predicates for use with `getCatalogSchema`.
 *
 * @example
 * ```ts
 * import { getCatalogSchema, catalogFilters } from '@a2ui/vue-renderer'
 *
 * // Only custom (non-built-in) components
 * getCatalogSchema(registry, catalogId, { filter: catalogFilters.customOnly })
 *
 * // Only specific components
 * getCatalogSchema(registry, catalogId, { filter: catalogFilters.only('Button', 'TextField') })
 *
 * // Everything except a few
 * getCatalogSchema(registry, catalogId, { filter: catalogFilters.exclude('Table', 'Calendar') })
 * ```
 */
export const catalogFilters = {
  /** Keeps only components that are NOT in the base Vuetify catalog. */
  customOnly: ((name: string) => !baseComponentKeys.has(name)) as CatalogFilter,

  /** Keeps only the listed component names. */
  only(...names: string[]): CatalogFilter {
    const set = new Set(names);
    return (name: string) => set.has(name);
  },

  /** Keeps everything except the listed component names. */
  exclude(...names: string[]): CatalogFilter {
    const set = new Set(names);
    return (name: string) => !set.has(name);
  },
};
