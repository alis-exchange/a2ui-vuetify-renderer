/**
 * ComponentApi schema for A2UITabs.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const TabsApi: ComponentApi = {
  name: 'Tabs',
  schema: z
    .object({
      ...CommonProps,
      tabs: z
        .array(
          z
            .object({
              title: DynamicStringSchema,
              child: ComponentIdSchema,
            })
            .strict(),
        )
        .min(1),
      action: ActionSchema.optional(),
    })
    .strict(),
};
