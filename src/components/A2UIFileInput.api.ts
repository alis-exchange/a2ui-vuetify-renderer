/**
 * ComponentApi schema for A2UIFileInput.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, DynamicStringSchema, DynamicValueSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const FileInputApi: ComponentApi = {
  name: 'FileInput',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicValueSchema.optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
};
