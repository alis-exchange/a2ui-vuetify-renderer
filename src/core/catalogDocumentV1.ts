import { Catalog, type ComponentApi, type FunctionImplementation } from '@a2ui/web_core/v1_0';
import { VUETIFY_FUNCTIONS_V1 } from '../catalog/vuetify-functions';
import { CATALOG_ID_V1 } from './constants';

/**
 * Builds the A2UI v1.0 Vuetify catalog document with web_core's own serializer
 * (`Catalog.toJson()`), so it follows `catalog_definition.json`: functions as a map keyed by name,
 * `@call`, `$ref`s into `common_types.json`, `protocolVersion: "1.0"`.
 *
 * The published `catalog/vuetify-catalog.v1.json` is this function applied to
 * `VUETIFY_COMPONENTS_V1`; {@link getCatalogSchema} applies it to the built-ins plus any
 * registered custom components.
 */
export function buildCatalogDocumentV1(components: readonly ComponentApi[], functions: readonly FunctionImplementation[] = VUETIFY_FUNCTIONS_V1): Record<string, any> {
  const catalog = new Catalog(CATALOG_ID_V1, '1.0', [...components], [...functions], {
    schemaUri: 'https://json-schema.org/draft/2020-12/schema',
    schemaId: CATALOG_ID_V1,
    title: 'A2UI Vuetify Catalog (v1.0)',
    description: 'Catalog of A2UI v1.0 components implemented with Vuetify 4 for the Vue renderer.',
  });
  const doc = catalog.toJson() as Record<string, any>;
  // web_core 0.15's serializer drops a code-defined component's description (the schema's
  // `.describe()`); prompt generators such as A2UI Express show it next to each signature.
  for (const api of components) {
    const entry = doc.components?.[api.name];
    if (entry && api.schema.description) doc.components[api.name] = { type: entry.type, description: api.schema.description, ...entry };
  }
  return doc;
}
