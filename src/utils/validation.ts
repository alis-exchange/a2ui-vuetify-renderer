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
 *   a data binding (`{ path }` on v0.9, `{ "@path" }` on v1.0), or a function call
 *   (`{ call, args }` / `{ "@call", args }`).
 *   Dynamic conditions are resolved with `resolveValue` each time the rule runs, so they
 *   see the live data model. If no resolver is given, or resolving throws, the rule passes:
 *   a broken rule must never lock the user out of an input.
 * - The resolved condition is read exactly as web_core's binder reads it, so these rules
 *   agree with the node's `validationErrors`:
 *   - A v1.0 `ValidationResult` (`{ valid, message?, severity? }`) fails only when `valid` is
 *     false and `severity` is `error` (the default); warnings and info never block.
 *   - Anything else fails when falsy.
 *   - Message: a function-call condition shows the rule's own `message`; a path-bound one
 *     shows the result's `message` (the agent wrote the finding there), falling back to the
 *     rule's; with neither, `Validation failed`.
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
 * Components should normally reach this through `useChecks`, which also exposes the binder's
 * `isValid` / `validationErrors` in node mode; call it directly only outside a provider.
 *
 * @example
 * ```ts
 * const { rules } = useChecks(() => props.node);
 * ```
 */
export function createVuetifyRules(checks: any[], resolveValue?: CheckValueResolver) {
  if (!Array.isArray(checks)) return [];

  return checks.map((check) => {
    return (value: any) => {
      // The branches below dereference `check` directly; a null entry reaches here from any
      // caller whose checks were not schema-validated (custom components skip that).
      if (check == null) return true;

      if (typeof check === 'object' && 'condition' in check) {
        const ruleMessage = typeof check.message === 'string' ? check.message : undefined;
        const outcome = readCheckOutcome(evaluateCondition(check.condition, resolveValue), isPathBound(check.condition) ? undefined : ruleMessage, ruleMessage ?? 'Validation failed');
        return outcome.valid || outcome.severity !== 'error' ? true : outcome.message;
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
 * Resolves a `DynamicBoolean` condition to its raw value. Dynamic forms need the resolver;
 * without one, or when resolving fails, the condition counts as passed (see {@link createVuetifyRules}).
 */
function evaluateCondition(condition: unknown, resolveValue?: CheckValueResolver): unknown {
  if (condition === null || typeof condition !== 'object') return condition;
  if (!resolveValue) return true;
  try {
    return resolveValue(condition);
  } catch {
    return true;
  }
}

/** Whether a condition is a data binding rather than a function call, in either syntax. */
function isPathBound(condition: unknown): boolean {
  if (condition === null || typeof condition !== 'object') return false;
  const rec = condition as Record<string, unknown>;
  return (typeof rec['@path'] === 'string' && !('@call' in rec)) || (typeof rec.path === 'string' && !('call' in rec));
}

interface CheckOutcome {
  valid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Reads a resolved condition the way web_core's `GenericBinder.extractValidationResult` does
 * (`resolution/generic-binder.js`), so Vuetify rules and the binder's `validationErrors` never
 * disagree. Keep the two in step when upgrading web_core.
 */
function readCheckOutcome(value: unknown, explicitMessage: string | undefined, fallbackMessage: string): CheckOutcome {
  if (typeof value === 'object' && value !== null && 'valid' in value) {
    const rec = value as Record<string, unknown>;
    const severity = rec.severity === 'warning' || rec.severity === 'info' ? rec.severity : 'error';
    const message = explicitMessage ?? (rec.message !== undefined && rec.message !== null ? String(rec.message) : fallbackMessage);
    return { valid: Boolean(rec.valid), message, severity };
  }
  return { valid: Boolean(value), message: explicitMessage ?? fallbackMessage, severity: 'error' };
}
