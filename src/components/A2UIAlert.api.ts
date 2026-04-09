/**
 * ComponentApi schema for A2UIAlert.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { ComponentIdSchema, DynamicStringSchema } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const AlertApi: ComponentApi = {
  name: 'Alert',
  schema: z
    .object({
      ...CommonProps,
      title: DynamicStringSchema.optional(),
      text: DynamicStringSchema.optional(),
      variant: z.enum(['success', 'info', 'warning', 'error']).default('info').optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
};
