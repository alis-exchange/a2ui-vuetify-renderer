/**
 * ComponentApi schema for A2UITable.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const TableApi: ComponentApi = {
  name: 'Table',
  schema: z
    .object({
      ...CommonProps,
      items: z.array(z.any()),
      columns: z.array(
        z.object({
          title: z.string().optional(),
          key: z.string().optional(),
        }),
      ),
    })
    .strict(),
};
