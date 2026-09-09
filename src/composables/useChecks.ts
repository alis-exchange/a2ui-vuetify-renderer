import type { ComponentModel } from '@a2ui/web_core/v0_9';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { createVuetifyRules } from '../utils/validation';
import { useA2UI } from './useA2UI';

/**
 * The return type of {@link useChecks}.
 */
export interface UseChecksReturn {
  /** Vuetify rule functions built from the node's `checks`; pass to an input's `rules` prop. */
  rules: ComputedRef<ReturnType<typeof createVuetifyRules>>;
  /**
   * Whether the node's checks currently pass, as reported by web_core's binder in node mode.
   * `true` on the legacy path, where the binder does not run.
   */
  isValid: ComputedRef<boolean>;
  /**
   * The failing check messages the binder reports in node mode, or `undefined` on the legacy
   * path. Pass to `error-messages` on inputs that should show them immediately, or use
   * {@link UseChecksReturn.errorMessages} for a value-based fallback.
   *
   * An empty array means "the binder found nothing", which is not the same as "there is
   * nothing to find": a literal `condition: false` is reported as passing by web_core's
   * binder (it falls back to the rule object, which is truthy), so callers that need the
   * failure surfaced should use {@link UseChecksReturn.errorMessages} instead.
   */
  validationErrors: ComputedRef<string[] | undefined>;
  /** The messages to show for `value`: the binder's when it reports any, otherwise the rules run against it. */
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

  // `checks` is CHECKABLE, never a binder-resolved dynamic value, so read the raw array off the
  // node: routing it through `resolveValue` is an identity no-op that would subscribe this
  // computed to the node's whole props signal and rebuild every rule closure on each emit.
  // The closures still call `resolveValue` on each `condition`, so cross-field checks stay live.
  const rules = computed(() => createVuetifyRules((toValue(node).properties.checks as any[]) ?? [], resolveValue));

  const isValid = computed(() => nodeProps?.value?.isValid !== false);

  const validationErrors = computed(() => {
    const errors = nodeProps?.value?.validationErrors;
    return Array.isArray(errors) ? (errors as string[]) : undefined;
  });

  // Only a non-empty binder result wins: an empty array is "no failure found", and the binder
  // misses a literal `condition: false`, so fall through to the rules rather than hiding it.
  const errorMessages = (value: unknown): string[] => (validationErrors.value?.length ? validationErrors.value : rules.value.map((rule) => rule(value)).filter((result): result is string => typeof result === 'string'));

  return { rules, isValid, validationErrors, errorMessages };
}
