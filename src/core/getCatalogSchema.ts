import { zodToJsonSchema } from 'zod-to-json-schema';
import baseCatalog from '../../catalog/vuetify-catalog.json';
import type { ComponentRegistry } from './ComponentRegistry';
/**
 * Returns the full JSON Schema representing the component catalog.
 * Dynamically assembles the schema based on components registered in the provided ComponentRegistry
 * to include any custom components registered at runtime.
 */
export function getCatalogSchema(registry: ComponentRegistry, catalogId: string): Record<string, any> {
  // Deep clone to avoid mutating the base imported module
  const schema = JSON.parse(JSON.stringify(baseCatalog));

  // Ensure components object exists
  if (!schema.components) {
    schema.components = {};
  }

  // Iterate over registered components and add basic schema stub for any missing
  const registeredKeys = registry.keys(catalogId);
  for (const key of registeredKeys) {
    if (!schema.components[key]) {
      // The base definitions that every A2UI component must have
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

      // Check if the user provided a custom api during registration
      const customApi = registry.getApi(catalogId, key);

      // If the user provided a custom schema, append it to the allOf array
      if (customApi) {
        // Convert the Zod schema to JSON Schema
        const convertedSchema = zodToJsonSchema(customApi.schema, {
          $refStrategy: 'none', // Prevent it from creating internal $defs
        });

        allOf.push(convertedSchema);
      }

      // Assign the assembled schema to the component key
      schema.components[key] = {
        type: 'object',
        allOf: allOf,
      };
    }
  }

  return schema;
}
