/**
 * ComponentApi schema for A2UIAutocomplete.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Autocomplete API for one protocol family; see {@link ProtocolKit}. */
export function buildAutocompleteApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicStringSchema, DynamicValueSchema } = kit;
  return {
    name: 'Autocomplete',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        options: z.array(z.any()),
        // DynamicValue, not a plain union: it carries the DynamicValue ref web_core's binder needs to
        // treat the prop as bindable (accept { path } and generate setValue).
        value: DynamicValueSchema,
        variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A dropdown with type-to-filter for picking from a long fixed list of options.'),
  };
}
