/**
 * The binder's view of a schema (`scrapeSchemaBehavior` from web_core): which props hold a
 * dynamic value, an action or checks, and which are plain data.
 */
export interface SchemaBehavior {
  type: string;
  shape?: Record<string, SchemaBehavior>;
  element?: SchemaBehavior;
}

const BINDING_KEYS = new Set(['path']);
const CALL_KEYS = new Set(['call', 'args', 'returnType']);

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const escape = (key: string) => key.replace(/~/g, '~0').replace(/\//g, '~1');

/** A v0.9 data binding (`{ path }`) or function call (`{ call, args?, returnType? }`). */
function isLegacy(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  return (typeof value.path === 'string' && keys.every((k) => BINDING_KEYS.has(k))) || (typeof value.call === 'string' && keys.every((k) => CALL_KEYS.has(k)));
}

/**
 * Finds v0.9-style bindings (`{ path }`) and function calls (`{ call, args }`) in a v1.0
 * component's properties, in the places a binding is expected. v1.0 spells them `{ "@path" }`
 * and `{ "@call" }`; web_core's v1.0 validation lets the old shapes through and then treats them
 * as literal objects, so a field bound the old way silently shows the object (or nothing).
 *
 * Only slots that take a dynamic value are checked: dynamic props, action event context and
 * `userMessage`, `functionCall`, check conditions and call arguments. Elsewhere a `{ path }`
 * object is ordinary data in v1.0 (a Table row, an option), so it is never reported.
 *
 * @param properties - The component's raw properties.
 * @param behavior - `scrapeSchemaBehavior(schema)` for the component's catalog schema.
 * @returns JSON Pointers to each offending value, relative to the component (e.g. `/text`).
 */
export function findLegacyBindings(properties: unknown, behavior: SchemaBehavior | undefined): string[] {
  const found: string[] = [];

  const dynamic = (value: unknown, pointer: string) => {
    if (isLegacy(value)) {
      found.push(pointer);
      return;
    }
    // A v1.0 call's arguments are dynamic values too.
    if (isRecord(value) && typeof value['@call'] === 'string' && isRecord(value.args)) {
      for (const [key, arg] of Object.entries(value.args)) dynamic(arg, `${pointer}/args/${escape(key)}`);
    }
  };

  const visit = (value: unknown, node: SchemaBehavior | undefined, pointer: string) => {
    if (value === undefined || !node) return;
    switch (node.type) {
      case 'DYNAMIC':
        dynamic(value, pointer);
        return;
      case 'ACTION': {
        if (!isRecord(value)) return;
        if (isRecord(value.event)) {
          if (value.event.userMessage !== undefined) dynamic(value.event.userMessage, `${pointer}/event/userMessage`);
          if (isRecord(value.event.context)) {
            for (const [key, item] of Object.entries(value.event.context)) dynamic(item, `${pointer}/event/context/${escape(key)}`);
          }
        }
        if (value.functionCall !== undefined) dynamic(value.functionCall, `${pointer}/functionCall`);
        return;
      }
      case 'CHECKABLE':
        if (Array.isArray(value)) value.forEach((rule, i) => isRecord(rule) && dynamic(rule.condition, `${pointer}/${i}/condition`));
        return;
      case 'OBJECT':
        if (isRecord(value) && node.shape) {
          for (const [key, child] of Object.entries(node.shape)) visit(value[key], child, `${pointer}/${escape(key)}`);
        }
        return;
      case 'ARRAY':
        if (Array.isArray(value)) value.forEach((item, i) => visit(item, node.element, `${pointer}/${i}`));
        return;
      default:
        return;
    }
  };

  visit(properties, behavior, '');
  return found;
}
