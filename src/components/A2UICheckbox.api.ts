/**
 * ComponentApi schema for A2UICheckbox.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, CheckableSchema, DynamicBooleanSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const CheckboxApi: ComponentApi = {
  name: 'Checkbox',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicBooleanSchema,
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
};
