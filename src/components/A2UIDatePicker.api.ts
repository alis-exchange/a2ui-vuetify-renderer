/**
 * ComponentApi schema for A2UIDatePicker.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, CheckableSchema, DynamicBooleanSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const DatePickerApi: ComponentApi = {
  name: 'DatePicker',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      value: DynamicStringSchema,
      min: DynamicStringSchema.optional(),
      max: DynamicStringSchema.optional(),
      color: z.string().optional(),
      multiple: z.union([z.boolean(), z.literal('range')]).optional(),
      readonly: DynamicBooleanSchema.optional(),
      disabled: DynamicBooleanSchema.optional(),
      landscape: DynamicBooleanSchema.optional(),
      showAdjacentMonths: DynamicBooleanSchema.optional(),
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
};
