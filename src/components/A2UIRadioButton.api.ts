/**
 * ComponentApi schema for A2UIRadioButton.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, CheckableSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const RadioButtonApi: ComponentApi = {
  name: 'RadioButton',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(
        z
          .object({
            label: DynamicStringSchema,
            value: z.string(),
          })
          .strict(),
      ),
      value: DynamicStringSchema,
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
};
