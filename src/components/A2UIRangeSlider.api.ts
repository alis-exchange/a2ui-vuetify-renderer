/**
 * ComponentApi schema for A2UIRangeSlider.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the RangeSlider API for one protocol family; see {@link ProtocolKit}. */
export function buildRangeSliderApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicStringSchema } = kit;
  return {
    name: 'RangeSlider',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        min: z.number().default(0).optional(),
        max: z.number(),
        value: z.union([z.array(z.number()).min(2).max(2), kit.PathBinding]),
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A slider with two handles for picking a [low, high] number range.'),
  };
}
