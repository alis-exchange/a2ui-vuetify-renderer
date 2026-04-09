/**
 * ComponentApi schema for A2UIRangeSlider.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const RangeSliderApi: ComponentApi = {
  name: 'RangeSlider',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      min: z.number().default(0).optional(),
      max: z.number(),
      value: z.union([z.array(z.number()).min(2).max(2), z.object({ path: z.string() })]),
      action: ActionSchema.optional(),
    })
    .strict(),
};
