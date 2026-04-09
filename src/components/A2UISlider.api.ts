/**
 * ComponentApi schema for A2UISlider.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, CheckableSchema, DynamicNumberSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const SliderApi: ComponentApi = {
  name: 'Slider',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      min: z.number().default(0).optional(),
      max: z.number(),
      value: DynamicNumberSchema,
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
};
