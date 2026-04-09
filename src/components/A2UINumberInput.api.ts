/**
 * ComponentApi schema for A2UINumberInput.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, CheckableSchema, DynamicNumberSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const NumberInputApi: ComponentApi = {
  name: 'NumberInput',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicNumberSchema.optional(),
      variant: z.enum(['filled', 'outlined', 'underlined']).default('outlined').optional(),
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
};
