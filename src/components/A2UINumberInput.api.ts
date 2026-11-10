/**
 * ComponentApi schema for A2UINumberInput.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the NumberInput API for one protocol family; see {@link ProtocolKit}. */
export function buildNumberInputApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicNumberSchema, DynamicStringSchema } = kit;
  return {
    name: 'NumberInput',
    schema: z
      .object({
        label: DynamicStringSchema,
        value: DynamicNumberSchema.optional(),
        variant: z.enum(['filled', 'outlined', 'underlined']).default('outlined').optional(),
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A numeric input bound to the data model.'),
  };
}
