/**
 * ComponentApi schema for A2UIRating.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Rating API for one protocol family; see {@link ProtocolKit}. */
export function buildRatingApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicNumberSchema } = kit;
  return {
    name: 'Rating',
    schema: z
      .object({
        max: z.number().default(5).optional(),
        value: DynamicNumberSchema,
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A row of stars for picking a rating up to max.'),
  };
}

/** The Rating API for A2UI v0.9 / v0.9.1. */
export const RatingApi: ComponentApi = buildRatingApi(A2UI_V09);
