/**
 * ComponentApi schema for A2UISlider.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Slider API for one protocol family; see {@link ProtocolKit}. */
export function buildSliderApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicNumberSchema, DynamicStringSchema } = kit;
  return {
    name: 'Slider',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        min: z.number().default(0).optional(),
        max: z.number(),
        value: DynamicNumberSchema,
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A slider for picking one number between min and max.'),
  };
}
