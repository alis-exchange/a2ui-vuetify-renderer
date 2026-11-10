import { FunctionCallSchema } from '@a2ui/web_core/v0_9';
import type { ZodTypeDef } from 'zod';
import { ignoreOverride, zodToJsonSchema, type Options } from 'zod-to-json-schema';

/** web_core's generic FunctionCall: `{ call, args?, returnType? }` with `call` any string. */
const FUNCTION_CALL_DEF: ZodTypeDef = (FunctionCallSchema as any)._def;

/**
 * The record inside `FunctionCallSchema.args` (each value a DynamicValue or a literal object).
 * DynamicValue recurses into FunctionCall through a `z.lazy`, so with `$refStrategy: 'none'`
 * zod-to-json-schema expands it under every call and gives up on the cycle with `{}`. That `{}`
 * accepts anything, so `additionalProperties: {}` validates the same at a fraction of the size.
 */
const FUNCTION_CALL_ARGS_DEF: ZodTypeDef = (FunctionCallSchema as any)._def.shape().args.unwrap()._def;

const collapseArgs = (def: ZodTypeDef) => (def === FUNCTION_CALL_ARGS_DEF ? { type: 'object', additionalProperties: {}, description: def.description } : undefined);

/** Function calls inline as web_core's generic shape (any function name). */
const INLINE_CALLS: Partial<Options> = {
  $refStrategy: 'none',
  override: (def) => collapseArgs(def) ?? ignoreOverride,
};

/** Function calls point at the document's `$defs.anyFunction`, so unknown names are rejected. */
const REF_CALLS: Partial<Options> = {
  $refStrategy: 'none',
  override: (def) => (def === FUNCTION_CALL_DEF ? { $ref: '#/$defs/anyFunction' } : (collapseArgs(def) ?? ignoreOverride)),
};

/**
 * Converts a component or function Zod schema to the inline JSON Schema the v0.9 catalog uses.
 * Shared by the catalog generator and {@link getCatalogSchema}, so custom components come out the
 * same shape as the built-in ones.
 *
 * `calls: 'ref'` (the default, for components) writes every function call as
 * `$ref: '#/$defs/anyFunction'`, the document's union of its own functions, so a validator
 * rejects a call to a function the catalog does not declare. `calls: 'inline'` (for the
 * functions' own argument schemas) keeps web_core's generic call shape: referencing
 * `anyFunction` from inside a function would make the document recursive, which web_core's
 * `Catalog.fromJson` and the A2UI Express prompt generator cannot load (stack overflow).
 */
export function zodToCatalogJson(schema: Parameters<typeof zodToJsonSchema>[0], calls: 'ref' | 'inline' = 'ref'): Record<string, any> {
  return zodToJsonSchema(schema, calls === 'ref' ? REF_CALLS : INLINE_CALLS) as Record<string, any>;
}
