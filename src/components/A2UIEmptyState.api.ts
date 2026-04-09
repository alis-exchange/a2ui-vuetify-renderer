/**
 * ComponentApi schema for A2UIEmptyState.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const EmptyStateApi: ComponentApi = {
  name: 'EmptyState',
  schema: z
    .object({
      ...CommonProps,
      title: DynamicStringSchema.optional(),
      text: DynamicStringSchema.optional(),
      icon: DynamicStringSchema.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
};
