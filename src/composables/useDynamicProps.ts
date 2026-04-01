import type { MaybeRefOrGetter, Ref } from 'vue';
import { computed, toValue } from 'vue';
import { useA2UI } from './useA2UI';

/**
 * A composable that automatically resolves data bindings for a given A2UI node.
 * Useful for authoring custom components without needing to manually wrap every property in `resolveValue`.
 *
 * @param node The A2UI component node definition.
 * @returns A computed ref containing the resolved properties.
 */
export function useDynamicProps<T extends Record<string, any>>(node: MaybeRefOrGetter<T>): Ref<Record<string, any>> {
  const { resolveValue } = useA2UI();

  return computed(() => {
    const rawNode = toValue(node);

    if (!rawNode) return {};

    const resolved: Record<string, any> = {};
    for (const key in rawNode) {
      if (Object.prototype.hasOwnProperty.call(rawNode, key)) {
        // We can just run everything through resolveValue, as it returns the original value
        // if it doesn't have a `path` or `call` structure.
        resolved[key] = resolveValue(rawNode[key]);
      }
    }

    return resolved;
  });
}
