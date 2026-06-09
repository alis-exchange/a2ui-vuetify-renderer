/**
 * Converts an array of A2UI check rules into Vuetify-compatible validation functions.
 *
 * Vuetify form inputs (`v-text-field`, `v-select`, etc.) accept a `rules` prop —
 * an array of functions that receive the current value and return `true` on success
 * or an error message string on failure. This function bridges A2UI's declarative
 * check format to that Vuetify convention.
 *
 * Supported check types:
 * - `'required'` or `{ type: 'required' }` — field must be truthy.
 * - `{ regex: '...' }` or `{ type: 'regex', pattern: '...' }` — value must match the pattern.
 * - `{ type: 'minLength', value: n }` — string length must be at least `n`.
 * - `{ type: 'maxLength', value: n }` — string length must be at most `n`.
 * - Raw functions — passed through directly.
 *
 * Each check may include a `message` property for a custom error string.
 *
 * @param checks - The array of check rules from a component node's properties.
 * @returns An array of Vuetify rule functions `(value: any) => true | string`.
 *
 * @example
 * ```ts
 * const rules = computed(() => {
 *   const checks = resolveValue<any[]>(props.node.properties.checks) ?? [];
 *   return createVuetifyRules(checks);
 * });
 * ```
 */
export function createVuetifyRules(checks: any[]) {
  if (!Array.isArray(checks)) return [];

  return checks.map((check) => {
    return (value: any) => {
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
