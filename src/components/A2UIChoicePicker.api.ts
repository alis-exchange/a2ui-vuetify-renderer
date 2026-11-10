/**
 * ComponentApi schema for A2UIChoicePicker.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the ChoicePicker API for one protocol family; see {@link ProtocolKit}. */
export function buildChoicePickerApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicStringSchema, DynamicValueSchema } = kit;
  return {
    name: 'ChoicePicker',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        options: z.array(z.any()),
        // DynamicValue, not a plain union: it carries the DynamicValue ref web_core's binder needs to
        // treat the prop as bindable (accept { path } and generate setValue).
        value: DynamicValueSchema,
        variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
        displayStyle: z.enum(['list', 'dropdown', 'segmented']).default('dropdown').optional(),
        checks: CheckableSchema.shape.checks,
        // Sent with { value } whenever the choice changes. Added after checks rather than beside
        // Select's: Express passes props by position, so inserting it earlier would shift checks.
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('Picks one or several options, shown as a dropdown (default), a list of radio buttons (list, single choice) or a row of segmented buttons (segmented).'),
  };
}

/** The ChoicePicker API for A2UI v0.9 / v0.9.1. */
export const ChoicePickerApi: ComponentApi = buildChoicePickerApi(A2UI_V09);
