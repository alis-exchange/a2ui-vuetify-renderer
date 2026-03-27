import type { ComponentRegistry } from './ComponentRegistry';
// @ts-ignore: We need to resolve JSON module resolution
import baseCatalog from '../../catalog/vuetify-catalog.json';

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
      // Provide a minimal JSON Schema valid structure for unknown custom components
      schema.components[key] = {
        type: "object",
        properties: {
          component: { const: key }
        },
        required: ["component"],
        // Ideally we'd use $defs/ComponentCommon but keeping it simple for custom ones
      };
    }
  }

  return schema;
}
