/**
 * ComponentApi schema for A2UISelect.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Select API for one protocol family; see {@link ProtocolKit}. */
export function buildSelectApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicStringSchema, DynamicValueSchema } = kit;
  return {
    name: 'Select',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        options: z.array(z.any()),
        // DynamicValue, not a plain union: it carries the DynamicValue ref web_core's binder needs to
        // treat the prop as bindable (accept { path } and generate setValue).
        value: DynamicValueSchema,
        variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A dropdown for picking one option, or several with variant multipleSelection, from a fixed list.'),
  };
}

/** The Select API for A2UI v0.9 / v0.9.1. */
export const SelectApi: ComponentApi = buildSelectApi(A2UI_V09);
