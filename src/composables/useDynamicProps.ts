import type { MaybeRefOrGetter, Ref } from 'vue';
import { computed, toValue } from 'vue';
import { useA2UI } from './useA2UI';

/**
 * A composable that automatically resolves data bindings for a given A2UI node.
 * Useful for authoring custom components without needing to manually wrap every property in `resolveValue`.
 *
 * Caution: it resolves *every* property on each render, including action and check props, and
 * those are evaluated actively. A function call in them (such as `openUrl`) would then run during
 * rendering whenever the browser counts a user gesture. In a component with an `action` or
 * `checks`, resolve only the props you read with `resolveValue` instead; dispatch actions with
 * `dispatchNodeAction` and read checks through `useChecks`.
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
