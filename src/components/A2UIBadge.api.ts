/**
 * ComponentApi schema for A2UIBadge.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Badge API for one protocol family; see {@link ProtocolKit}. */
export function buildBadgeApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'Badge',
    schema: z
      .object({
        content: DynamicStringSchema,
        color: z.string().optional(),
        child: ComponentIdSchema,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A small count or label overlaid on its child.'),
  };
}
