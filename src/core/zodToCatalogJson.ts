import { FunctionCallSchema } from '@a2ui/web_core/v0_9';
import type { ZodTypeDef } from 'zod';
import { ignoreOverride, zodToJsonSchema, type Options } from 'zod-to-json-schema';

/**
 * The record inside `FunctionCallSchema.args` (web_core >= 0.12 types each value as a
 * DynamicValue or a literal object). DynamicValue recurses into FunctionCall through a
 * `z.lazy`, so with `$refStrategy: 'none'` zod-to-json-schema expands it under every bindable
 * property, logs "Recursive reference detected", and gives up on the cycle with `{}`. That `{}`
 * branch accepts anything, so the expansion validates exactly like `additionalProperties: {}`
 * while nearly doubling the catalog.
 */
const FUNCTION_CALL_ARGS_DEF: ZodTypeDef = (FunctionCallSchema as any)._def.shape().args.unwrap()._def;

const OPTIONS: Partial<Options> = {
  $refStrategy: 'none',
  override: (def) => (def === FUNCTION_CALL_ARGS_DEF ? { type: 'object', additionalProperties: {}, description: def.description } : ignoreOverride),
};

/**
 * Converts a component or function Zod schema to the inline JSON Schema the catalog uses.
 * Shared by the catalog generator and {@link getCatalogSchema} so custom components come out
 * the same shape as the built-in ones.
 */
export function zodToCatalogJson(schema: Parameters<typeof zodToJsonSchema>[0]): Record<string, any> {
  return zodToJsonSchema(schema, OPTIONS) as Record<string, any>;
}
