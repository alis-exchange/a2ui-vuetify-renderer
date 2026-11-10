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
   * {@link UseChecksReturn.errorMessages} for a value-based fallback. An empty array means
   * every check passes.
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

  const validationErrors = computed(() => {
    const errors = nodeProps?.value?.validationErrors;
    return Array.isArray(errors) ? (errors as string[]) : undefined;
  });

  // In node mode web_core's binder has already evaluated every check and reports the failures,
  // so the Vuetify rule just reads that verdict: no second evaluation, nothing to keep in step
  // with the binder. A boolean computed, so `rules` is rebuilt only if the mode flips.
  const hasBinderVerdict = computed(() => validationErrors.value !== undefined);
  const binderRule = (): true | string => validationErrors.value?.[0] ?? true;

  // Elsewhere (the legacy render path, or a schema without CheckableSchema) the rules evaluate the
  // conditions themselves, passively through resolveValue, as web_core's binder does.

  // `checks` is CHECKABLE, never a binder-resolved dynamic value, so read the raw array off the
  // node: routing it through `resolveValue` is an identity no-op that would subscribe this
  // computed to the node's whole props signal and rebuild every rule closure on each emit.
  // Rules read the live verdict (or resolve each `condition`) when they run, so cross-field
  // checks stay live. One rule in node mode: Vuetify shows one message at a time anyway.
  const rules = computed(() => {
    const checks = (toValue(node).properties.checks as any[]) ?? [];
    if (checks.length === 0) return [];
    return hasBinderVerdict.value ? [binderRule] : createVuetifyRules(checks, resolveValue);
  });

  const isValid = computed(() => nodeProps?.value?.isValid !== false);

  // The binder's verdict when there is one (web_core >= 0.15 reports a literal `condition: false`
  // correctly, so an empty list really means "passing"); otherwise the rules run against `value`.
  const errorMessages = (value: unknown): string[] => validationErrors.value ?? rules.value.map((rule) => rule(value)).filter((result): result is string => typeof result === 'string');

  return { rules, isValid, validationErrors, errorMessages };
}
