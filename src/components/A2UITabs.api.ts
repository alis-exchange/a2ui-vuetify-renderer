/**
 * ComponentApi schema for A2UITabs.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Tabs API for one protocol family; see {@link ProtocolKit}. */
export function buildTabsApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'Tabs',
    schema: z
      .object({
        tabs: z
          .array(
            z
              .object({
                title: DynamicStringSchema,
                child: ComponentIdSchema,
              })
              .strict(),
          )
          .min(1),
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('Tabbed sections: each tab has a title and one child shown when selected.'),
  };
}
