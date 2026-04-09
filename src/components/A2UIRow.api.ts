/**
 * ComponentApi schema for A2UIRow.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ChildListSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const RowApi: ComponentApi = {
  name: 'Row',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
      justify: z.enum(['center', 'end', 'spaceAround', 'spaceBetween', 'spaceEvenly', 'start', 'stretch']).default('start').optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
    })
    .strict(),
};
