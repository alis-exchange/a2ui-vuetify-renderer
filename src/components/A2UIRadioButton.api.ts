/**
 * ComponentApi schema for A2UIRadioButton.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the RadioButton API for one protocol family; see {@link ProtocolKit}. */
export function buildRadioButtonApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicStringSchema } = kit;
  return {
    name: 'RadioButton',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        options: z.array(
          z
            .object({
              label: DynamicStringSchema,
              value: z.string(),
            })
            .strict(),
        ),
        value: DynamicStringSchema,
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A group of radio buttons for picking exactly one option, all options visible.'),
  };
}
