import type { ComponentModel } from '@a2ui/web_core/v0_9';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { createVuetifyRules } from '../utils/validation';
import { useA2UI } from './useA2UI';

/**
 * The return type of {@link useChecks}.
 */
export interface UseChecksReturn {
  /** Vuetify rule functions built from the node's `checks`; pass to an input's `rules` prop. */
  rules: ComputedRef<Array<(value: any) => true | string>>;
  /**
   * Whether the node's checks currently pass, as reported by web_core's binder in node mode.
   * `true` on the legacy path, where the binder does not run.
   */
  isValid: ComputedRef<boolean>;
  /**
   * The failing check messages the binder reports in node mode, or `undefined` on the legacy
   * path. Pass to `error-messages` on inputs that should show them immediately, or use
   * {@link UseChecksReturn.errorMessages} for a value-based fallback.
   */
  validationErrors: ComputedRef<string[] | undefined>;
  /** The messages to show for `value`: the binder's when available, otherwise the rules run against it. */
  errorMessages: (value: unknown) => string[];
}

/**
 * Bridges a node's A2UI `checks` to Vue.
 *
 * In node mode web_core's binder evaluates the checks reactively and reports `isValid` and
 * `validationErrors` on the node; this composable exposes them and, for components that hand
 * validation to Vuetify, still builds the equivalent `rules`. On the legacy path only the rules
 * exist. Button and IconButton gate on `isValid`; Slider and DatePicker show `validationErrors`.
 *
 * @param node - The component node, as a ref, getter, or plain object.
 *
 * @example
 * ```ts
 * const { rules, isValid, validationErrors } = useChecks(() => props.node);
 * ```
 */
export function useChecks(node: MaybeRefOrGetter<ComponentModel>): UseChecksReturn {
  const { resolveValue, nodeProps } = useA2UI();

  const rules = computed(() => {
    const checks = resolveValue<any[]>(toValue(node).properties.checks) ?? [];
    return createVuetifyRules(checks, resolveValue);
  });

  const isValid = computed(() => nodeProps?.value?.isValid !== false);

  const validationErrors = computed(() => {
    const errors = nodeProps?.value?.validationErrors;
    return Array.isArray(errors) ? (errors as string[]) : undefined;
  });

  const errorMessages = (value: unknown): string[] => validationErrors.value ?? rules.value.map((rule) => rule(value)).filter((result): result is string => typeof result === 'string');

  return { rules, isValid, validationErrors, errorMessages };
}
