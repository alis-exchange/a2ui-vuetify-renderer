/**
 * ComponentApi schema for A2UIRangeSlider.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the RangeSlider API for one protocol family; see {@link ProtocolKit}. */
export function buildRangeSliderApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicStringSchema } = kit;
  return {
    name: 'RangeSlider',
    schema: z
      .object({
        ...kit.commonProps,
        label: DynamicStringSchema.optional(),
        min: z.number().default(0).optional(),
        max: z.number(),
        value: z.union([z.array(z.number()).min(2).max(2), kit.PathBinding]),
        action: ActionSchema.optional(),
      })
      .strict(),
  };
}

/** The RangeSlider API for A2UI v0.9 / v0.9.1. */
export const RangeSliderApi: ComponentApi = buildRangeSliderApi(A2UI_V09);
