/**
 * ComponentApi schema for A2UIEmptyState.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the EmptyState API for one protocol family; see {@link ProtocolKit}. */
export function buildEmptyStateApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'EmptyState',
    schema: z
      .object({
        title: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        icon: DynamicStringSchema.optional(),
        child: ComponentIdSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A placeholder shown when there is nothing to display yet, with title, text and icon.'),
  };
}
