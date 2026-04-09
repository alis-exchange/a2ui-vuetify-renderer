/**
 * ComponentApi schema for A2UIBadge.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const BadgeApi: ComponentApi = {
  name: 'Badge',
  schema: z
    .object({
      ...CommonProps,
      content: DynamicStringSchema,
      color: z.string().optional(),
      child: ComponentIdSchema,
    })
    .strict(),
};
