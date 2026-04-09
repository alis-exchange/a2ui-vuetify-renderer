import { zodToJsonSchema } from 'zod-to-json-schema';
import baseCatalog from '../../catalog/vuetify-catalog.json';
import type { CatalogFilter } from './catalogFilters';
import type { ComponentRegistry } from './ComponentRegistry';

export interface GetCatalogSchemaOptions {
  /**
   * Optional predicate to filter which components appear in the returned schema.
   * Called once per component name — return `true` to keep, `false` to exclude.
   *
   * When omitted every component is included (backwards-compatible default).
   *
   * @example
   * ```ts
   * import { catalogFilters } from '@a2ui/vue-renderer'
   *
   * // Only custom components
   * getCatalogSchema(registry, id, { filter: catalogFilters.customOnly })
   *
   * // Arbitrary predicate
   * getCatalogSchema(registry, id, { filter: name => name.startsWith('My') })
   * ```
   */
  filter?: CatalogFilter;
}

/**
 * Returns a JSON Schema representing the component catalog.
 * Dynamically assembles the schema based on components registered in the provided ComponentRegistry
 * to include any custom components registered at runtime.
 *
 * Pass `options.filter` to narrow the returned components.
 */
export function getCatalogSchema(registry: ComponentRegistry, catalogId: string, options?: GetCatalogSchemaOptions): Record<string, any> {
  const schema = JSON.parse(JSON.stringify(baseCatalog));

  if (!schema.components) {
    schema.components = {};
  }

  const registeredKeys = registry.keys(catalogId);
  for (const key of registeredKeys) {
    if (!schema.components[key]) {
      const allOf: any[] = [
        { $ref: '#/$defs/ComponentCommon' },
        { $ref: '#/$defs/CatalogComponentCommon' },
        {
          type: 'object',
          properties: {
            component: { const: key },
          },
          required: ['component'],
        },
      ];

      const customApi = registry.getApi(catalogId, key);
      if (customApi) {
        const convertedSchema = zodToJsonSchema(customApi.schema, {
          $refStrategy: 'none',
        });
        allOf.push(convertedSchema);
      }

      schema.components[key] = {
        type: 'object',
        allOf: allOf,
      };
    }
  }

  if (options?.filter) {
    for (const key of Object.keys(schema.components)) {
      if (!options.filter(key)) {
        delete schema.components[key];
      }
    }
  }

  return schema;
}
