import type { ComponentModel } from '@a2ui/web_core/v0_9';
import { computed, toValue, type MaybeRefOrGetter, type WritableComputedRef } from 'vue';
import { useA2UI } from './useA2UI';

/**
 * Two-way binds one property of an A2UI node, on any protocol version.
 *
 * Reading resolves the property like `resolveValue` (literal, binding or function call), falling
 * back to `fallback` when it resolves to `undefined`. Writing stores the value at the data path
 * the property is bound to, and is a no-op when the property is a literal.
 *
 * Writes go through the setter web_core's binder generates for the property (`setValue` for
 * `value`), so the component never reads the binding itself: the same code handles v0.9
 * `{ path }` and v1.0 `{ "@path" }`, and relative paths inside templates resolve against the
 * item's data scope. On the legacy render path (`nodeResolver: false`, v0.9 only) there is no
 * binder, so it writes the raw binding's path through the node's `DataContext` instead.
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
  const setterName = `set${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;

  return computed<T>({
    get() {
      return resolveValue<T>(toValue(node).properties[prop]) ?? (fallback as T);
    },
    set(next: T) {
      const setter = (nodeProps?.value as Record<string, unknown> | undefined)?.[setterName];
      if (typeof setter === 'function') {
        setter(next);
        return;
      }
      const raw = toValue(node).properties[prop];
      if (!raw || typeof raw !== 'object') return;
      const path = dataContext.value?.atLeastV10 ? raw['@path'] : raw.path;
      if (typeof path !== 'string') return;
      if (dataContext.value) dataContext.value.set(path, next);
      else setData(path, next);
    },
  });
}
