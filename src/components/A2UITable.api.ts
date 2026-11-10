/**
 * ComponentApi schema for A2UITable.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Table API for one protocol family; see {@link ProtocolKit}. */
export function buildTableApi(kit: ProtocolKit): ComponentApi {
  return {
    name: 'Table',
    schema: z
      .object({
        items: z.array(z.any()),
        columns: z.array(
          z.object({
            title: z.string().optional(),
            key: z.string().optional(),
          }),
        ),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A data table: columns name the fields, items are the rows.'),
  };
}
