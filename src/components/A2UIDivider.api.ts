/**
 * ComponentApi schema for A2UIDivider.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const DividerApi: ComponentApi = {
  name: 'Divider',
  schema: z
    .object({
      ...CommonProps,
      axis: z.enum(['horizontal', 'vertical']).default('horizontal').optional(),
    })
    .strict(),
};
