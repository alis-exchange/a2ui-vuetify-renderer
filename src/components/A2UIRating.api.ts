/**
 * ComponentApi schema for A2UIRating.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, DynamicNumberSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const RatingApi: ComponentApi = {
  name: 'Rating',
  schema: z
    .object({
      ...CommonProps,
      max: z.number().default(5).optional(),
      value: DynamicNumberSchema,
      action: ActionSchema.optional(),
    })
    .strict(),
};
