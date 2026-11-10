import baseCatalog from '../../catalog/vuetify-catalog.json';
import { VUETIFY_COMPONENTS_V1 } from '../catalog/vuetify-components';
import { buildCatalogDocumentV1 } from './catalogDocumentV1';
import type { CatalogFilter } from './catalogFilters';
import type { ComponentRegistry } from './ComponentRegistry';
import { CATALOG_ID_V1 } from './constants';
import { zodToCatalogJson } from './zodToCatalogJson';

/**
 * Options for {@link getCatalogSchema}.
 */
export interface GetCatalogSchemaOptions {
  /**
   * Optional predicate to filter which components appear in the returned schema.
   * Called once per component name — return `true` to keep, `false` to exclude.
   *
   * When omitted every component is included (backwards-compatible default).
   *
   * @example
   * ```ts
   * import { catalogFilters } from '@alis-build/a2ui-vuetify-renderer'
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
 *
 * For {@link CATALOG_ID_V1} it returns the A2UI v1.0 document instead, rebuilt by web_core from
 * the built-in v1.0 schemas plus each registered custom component's v1.0 schema
 * (`registry.registerApi(CATALOG_ID_V1, type, buildMyApi(A2UI_V10))`). A custom component with
 * no v1.0 schema is left out, with a warning, rather than described in the wrong syntax.
 */
export function getCatalogSchema(registry: ComponentRegistry, catalogId: string, options?: GetCatalogSchemaOptions): Record<string, any> {
  if (catalogId === CATALOG_ID_V1) return getCatalogSchemaV1(registry, options);

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
        allOf.push(zodToCatalogJson(customApi.schema));
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

function getCatalogSchemaV1(registry: ComponentRegistry, options?: GetCatalogSchemaOptions): Record<string, any> {
  const builtIn = new Set(VUETIFY_COMPONENTS_V1.map((api) => api.name));
  const apis = [...VUETIFY_COMPONENTS_V1];
  const missing: string[] = [];
  for (const type of registry.keys(CATALOG_ID_V1)) {
    if (builtIn.has(type)) continue;
    const api = registry.getApi(CATALOG_ID_V1, type);
    if (api) apis.push(api);
    else missing.push(type);
  }
  if (missing.length > 0) {
    console.warn(`[a2ui-vuetify-renderer] Left out of the v1.0 catalog, no v1.0 schema registered: ${missing.join(', ')}. Register one with registry.registerApi(CATALOG_ID_V1, type, api).`);
  }
  const kept = options?.filter ? apis.filter((api) => options.filter!(api.name)) : apis;
  return buildCatalogDocumentV1(kept);
}
