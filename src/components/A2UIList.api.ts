/**
 * ComponentApi schema for A2UIList.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ChildListSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const ListApi: ComponentApi = {
  name: 'List',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
      direction: z.enum(['vertical', 'horizontal']).default('vertical').optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
    })
    .strict(),
};
