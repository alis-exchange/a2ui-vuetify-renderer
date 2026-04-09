/**
 * ComponentApi schema for A2UIButton.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, CheckableSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const ButtonApi: ComponentApi = {
  name: 'Button',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      text: DynamicStringSchema.optional(),
      icon: DynamicStringSchema.optional(),
      variant: z.enum(['default', 'primary', 'borderless']).default('default').optional(),
      action: ActionSchema,
      checks: CheckableSchema.shape.checks,
    })
    .strict()
    .refine((data) => data.label !== undefined || data.text !== undefined || data.icon !== undefined, {
      message: 'Button requires at least one of label, text, or icon',
    }),
};
