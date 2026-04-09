/**
 * ComponentApi schema for A2UIExpansionPanel.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const ExpansionPanelApi: ComponentApi = {
  name: 'ExpansionPanel',
  schema: z
    .object({
      ...CommonProps,
      title: DynamicStringSchema,
      child: ComponentIdSchema,
      action: ActionSchema.optional(),
    })
    .strict(),
};
