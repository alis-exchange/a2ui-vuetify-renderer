/**
 * ComponentApi schema for A2UIIconButton.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, CheckableSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const IconButtonApi: ComponentApi = {
  name: 'IconButton',
  schema: z
    .object({
      ...CommonProps,
      icon: DynamicStringSchema,
      variant: z.enum(['default', 'primary', 'borderless']).default('default').optional(),
      action: ActionSchema,
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
};
