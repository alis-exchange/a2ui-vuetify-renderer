import { ResolvedBinding, isWritable, type ComponentModel } from '@a2ui/web_core/v0_9';
import { computed, toValue, type MaybeRefOrGetter, type WritableComputedRef } from 'vue';
import { useA2UI } from './useA2UI';

/**
 * Two-way binds one property of an A2UI node, on any protocol version.
 *
 * Reading resolves the property like `resolveValue` (literal, binding or function call), falling
 * back to `fallback` when it resolves to `undefined`. Writing stores the value at the data path
 * the property is bound to, and is a no-op when the property is a literal or a function call.
 *
 * In node mode, web_core's `NodeResolver` hands each bound property to the component as a
 * `WritableBinding`, whose `set` writes through the node's `DataContext`: it already knows the
 * version's syntax (`{ path }` on v0.9, `{ "@path" }` on v1.0) and resolves a relative path
 * against the template row's data scope. The component never reads the binding itself. On the
 * legacy render path (`nodeResolver: false`, v0.9 only) there are no bindings, so it reads the
 * raw binding's path and writes it through the node's `DataContext` the same way.
 *
 * @param node - The node whose property to bind, usually `() => props.node`.
 * @param prop - The property name, e.g. `'value'` or `'checked'`.
 * @param fallback - Value to read when the property resolves to `undefined`.
 *
 * @example
 * ```ts
 * const value = useBinding<string>(() => props.node, 'value', '');
 * // <v-text-field v-model="value" />
 * ```
 */
export function useBinding<T>(node: MaybeRefOrGetter<ComponentModel>, prop: string, fallback?: T): WritableComputedRef<T> {
  const { resolveValue, nodeProps, dataContext, setData } = useA2UI();

  return computed<T>({
    get() {
      return resolveValue<T>(toValue(node).properties[prop]) ?? (fallback as T);
    },
    set(next: T) {
      const bound = (nodeProps?.value as Record<string, unknown> | undefined)?.[prop];
      if (bound instanceof ResolvedBinding) {
        // A read-only binding is a literal or a function call: there is nowhere to write.
        if (isWritable(bound)) bound.set(next);
        return;
      }
      // Legacy render path: no node tree, so no bindings to write through.
      const raw = toValue(node).properties[prop];
      if (!raw || typeof raw !== 'object') return;
      const path = dataContext.value?.atLeastV10 ? raw['@path'] : raw.path;
      if (typeof path !== 'string') return;
      if (dataContext.value) dataContext.value.set(path, next);
      else setData(path, next);
    },
  });
}
