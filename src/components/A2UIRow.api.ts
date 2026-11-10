/**
 * ComponentApi schema for A2UIRow.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Row API for one protocol family; see {@link ProtocolKit}. */
export function buildRowApi(kit: ProtocolKit): ComponentApi {
  const { ChildListSchema } = kit;
  return {
    name: 'Row',
    schema: z
      .object({
        children: ChildListSchema,
        justify: z.enum(['center', 'end', 'spaceAround', 'spaceBetween', 'spaceEvenly', 'start', 'stretch']).default('start').optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('Lays children out horizontally; use weight on a child to share free space.'),
  };
}

/** The Row API for A2UI v0.9 / v0.9.1. */
export const RowApi: ComponentApi = buildRowApi(A2UI_V09);
