/**
 * ComponentApi schema for A2UIList.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the List API for one protocol family; see {@link ProtocolKit}. */
export function buildListApi(kit: ProtocolKit): ComponentApi {
  const { ChildListSchema } = kit;
  return {
    name: 'List',
    schema: z
      .object({
        children: ChildListSchema,
        direction: z.enum(['vertical', 'horizontal']).default('vertical').optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A vertical or horizontal list of children, often a template repeated over a data array.'),
  };
}
