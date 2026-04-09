/**
 * ComponentApi schema for A2UIModal.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, ComponentIdSchema, DynamicBooleanSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const ModalApi: ComponentApi = {
  name: 'Modal',
  schema: z
    .object({
      ...CommonProps,
      trigger: ComponentIdSchema,
      content: ComponentIdSchema,
      open: DynamicBooleanSchema.optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
};
