/**
 * ComponentApi schema for A2UITimePicker.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const TimePickerApi: ComponentApi = {
  name: 'TimePicker',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      value: DynamicStringSchema,
      action: ActionSchema.optional(),
    })
    .strict(),
};
