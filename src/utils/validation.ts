/**
 * Resolves an A2UI `DynamicValue` (literal, `{ path }` binding or `{ call, args }`) to
 * its runtime value. Matches the shape of `useA2UI().resolveValue`.
 */
export type CheckValueResolver = <V = unknown>(value: any) => V | undefined;

/**
 * Converts an array of A2UI check rules into Vuetify-compatible validation functions.
 *
 * Vuetify form inputs (`v-text-field`, `v-select`, etc.) accept a `rules` prop:
 * an array of functions that receive the current value and return `true` on success
 * or an error message string on failure. This function bridges A2UI's declarative
 * check format to that Vuetify convention.
 *
 * Protocol shape (`CheckRule` from the A2UI spec, what agents send):
 * - `{ condition, message }` where `condition` is a `DynamicBoolean`: a literal boolean,
 *   a data binding `{ path: '/name' }`, or a function call
 *   `{ call: 'required', args: { value: { path: '/name' } } }`.
 *   Dynamic conditions are resolved with `resolveValue` each time the rule runs, so they
 *   see the live data model. A rule passes when the condition is truthy.
 *   If no resolver is given, or resolving throws, the rule passes: a broken rule must
 *   never lock the user out of an input.
 *
 * Legacy shapes (kept for direct callers; `@a2ui/web_core` >= 0.10.6 rejects them at
 * message level because `checks` must match `CheckRule`):
 * - `'required'` or `{ type: 'required' }`: field must be truthy.
 * - `{ regex: '...' }` or `{ type: 'regex', pattern: '...' }`: value must match the pattern.
 * - `{ type: 'minLength', value: n }` / `{ type: 'maxLength', value: n }`.
 * - Raw functions: passed through directly.
 *
 * Each check may include a `message` property for a custom error string.
 *
 * @param checks - The array of check rules from a component node's properties.
 * @param resolveValue - Resolver for dynamic conditions, normally `useA2UI().resolveValue`.
 * @returns An array of Vuetify rule functions `(value: any) => true | string`.
 *
 * @example
 * ```ts
 * const { resolveValue } = useA2UI();
 * const rules = computed(() => {
 *   const checks = resolveValue<any[]>(props.node.properties.checks) ?? [];
 *   return createVuetifyRules(checks, resolveValue);
 * });
 * ```
 */
export function createVuetifyRules(checks: any[], resolveValue?: CheckValueResolver) {
  if (!Array.isArray(checks)) return [];

  return checks.map((check) => {
    return (value: any) => {
      if (check && typeof check === 'object' && 'condition' in check) {
        return evaluateCondition(check.condition, resolveValue) || check.message || 'Invalid value';
      }

      if (check === 'required' || check.type === 'required' || check.name === 'required') {
        return !!value || check.message || 'Field is required';
      }

      if (check.regex || check.type === 'regex') {
        const pattern = check.regex || check.pattern;
        if (pattern) {
          const regex = new RegExp(pattern);
          return regex.test(value) || check.message || 'Invalid format';
        }
      }

      if (check.type === 'minLength' && check.value !== undefined) {
        return (value !== undefined && value !== null && String(value).length >= check.value) || check.message || `Minimum length is ${check.value}`;
      }

      if (check.type === 'maxLength' && check.value !== undefined) {
        return value === undefined || value === null || String(value).length <= check.value || check.message || `Maximum length is ${check.value}`;
      }

      // Allow functions if they pass executable rules
      if (typeof check === 'function') {
        return check(value);
      }

      return true;
    };
  });
}

/**
 * Evaluates a `DynamicBoolean` condition. Dynamic forms need the resolver; without one,
 * or when resolving fails, the condition counts as passed (see {@link createVuetifyRules}).
 */
function evaluateCondition(condition: unknown, resolveValue?: CheckValueResolver): boolean {
  if (typeof condition === 'boolean') return condition;
  if (condition === null || typeof condition !== 'object') return Boolean(condition);
  if (!resolveValue) return true;
  try {
    return Boolean(resolveValue(condition));
  } catch {
    return true;
  }
}
