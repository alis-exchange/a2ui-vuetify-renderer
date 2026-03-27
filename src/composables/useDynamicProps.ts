import { computed, isRef } from 'vue';
import type { Ref } from 'vue';
import { useA2UI } from './useA2UI';

/**
 * A composable that automatically resolves data bindings for a given A2UI node.
 * Useful for authoring custom components without needing to manually wrap every property in `resolveValue`.
 * 
 * @param node The A2UI component node definition.
 * @returns A computed ref containing the resolved properties.
 */
export function useDynamicProps<T extends Record<string, any>>(node: T | Ref<T>): Ref<Record<keyof T, any>> {
  const { resolveValue } = useA2UI();

  return computed(() => {
    const rawNode = isRef(node) ? node.value : node;
    
    if (!rawNode) return {} as Record<keyof T, any>;

    const resolved: Record<string, any> = {};
    for (const key in rawNode) {
      if (Object.prototype.hasOwnProperty.call(rawNode, key)) {
        // We can just run everything through resolveValue, as it returns the original value 
        // if it doesn't have a `path` or `call` structure.
        resolved[key] = resolveValue(rawNode[key]);
      }
    }

    return resolved as Record<keyof T, any>;
  });
}

