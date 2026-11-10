import type { ComponentModel } from '@a2ui/web_core/v0_9';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter, type WritableComputedRef } from 'vue';
import { useA2UI } from './useA2UI';
import { useBinding } from './useBinding';
import { useChecks, type UseChecksReturn } from './useChecks';

/**
 * The return type of {@link useChoiceInput}.
 */
export interface UseChoiceInputReturn {
  /** The resolved `label`. */
  label: ComputedRef<string | undefined>;
  /** The resolved `options`, passed to the Vuetify input as `items`. */
  options: ComputedRef<readonly unknown[]>;
  /** Whether `variant` is `multipleSelection`. */
  multiple: ComputedRef<boolean>;
  /** The bound `value`; setting it writes the choice back and sends the node's action with `{ value }`. */
  modelValue: WritableComputedRef<unknown>;
  /** Vuetify rules built from the node's `checks`. */
  rules: UseChecksReturn['rules'];
}

/**
 * What every dropdown-style choice input shares (Select, Autocomplete, Combobox): label,
 * options, single or multiple selection, the two-way value with its change action, and checks.
 * The components differ only in which Vuetify input they render.
 *
 * @param node - The component node, as a ref, getter, or plain object.
 */
export function useChoiceInput(node: MaybeRefOrGetter<ComponentModel>): UseChoiceInputReturn {
  const { resolveValue, dispatchNodeAction } = useA2UI();
  const boundValue = useBinding<unknown>(node, 'value');

  const label = computed(() => resolveValue<string | undefined>(toValue(node).properties.label));
  const options = computed(() => resolveValue<readonly unknown[]>(toValue(node).properties.options) || []);
  const multiple = computed(() => resolveValue<string | undefined>(toValue(node).properties.variant) === 'multipleSelection');

  const modelValue = computed<unknown>({
    get() {
      return resolveValue<unknown>(toValue(node).properties.value);
    },
    set(value) {
      boundValue.value = value;
      dispatchNodeAction(toValue(node), { value });
    },
  });

  const { rules } = useChecks(node);

  return { label, options, multiple, modelValue, rules };
}
