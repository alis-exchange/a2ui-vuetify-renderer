const BINDING_KEYS = new Set(['path']);
const CALL_KEYS = new Set(['call', 'args', 'returnType']);
const MAX_DEPTH = 8;

/**
 * Finds v0.9-style bindings (`{ path }`) and function calls (`{ call, args }`) in a v1.0
 * component's properties. v1.0 spells them `{ "@path" }` and `{ "@call" }`; web_core's v1.0
 * validation lets the old shapes through, and then treats them as literal objects, so a field
 * bound the old way silently shows the object (or nothing) instead of its data.
 *
 * A ChildList template (`{ componentId, path }`) keeps its unprefixed `path` in v1.0 and is not
 * reported.
 *
 * @returns JSON Pointers to each offending value, relative to the component (e.g. `/text`).
 */
export function findLegacyBindings(properties: unknown): string[] {
  const found: string[] = [];
  const visit = (value: unknown, pointer: string, depth: number) => {
    if (depth > MAX_DEPTH || value === null || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach((item, i) => visit(item, `${pointer}/${i}`, depth + 1));
      return;
    }
    const rec = value as Record<string, unknown>;
    const keys = Object.keys(rec);
    const isBinding = typeof rec.path === 'string' && keys.every((k) => BINDING_KEYS.has(k));
    const isCall = typeof rec.call === 'string' && keys.every((k) => CALL_KEYS.has(k));
    if (isBinding || isCall) {
      found.push(pointer || '/');
      return;
    }
    for (const key of keys) visit(rec[key], `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`, depth + 1);
  };
  visit(properties, '', 0);
  return found;
}
