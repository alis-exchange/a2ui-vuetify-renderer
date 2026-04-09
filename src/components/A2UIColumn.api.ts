/**
 * ComponentApi schema for A2UIColumn.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ChildListSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const ColumnApi: ComponentApi = {
  name: 'Column',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
      justify: z.enum(['start', 'center', 'end', 'spaceBetween', 'spaceAround', 'spaceEvenly', 'stretch']).default('start').optional(),
      align: z.enum(['center', 'end', 'start', 'stretch']).default('stretch').optional(),
    })
    .strict(),
};
