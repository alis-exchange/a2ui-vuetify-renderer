/**
 * ComponentApi schema for A2UIExpansionPanel.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the ExpansionPanel API for one protocol family; see {@link ProtocolKit}. */
export function buildExpansionPanelApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'ExpansionPanel',
    schema: z
      .object({
        title: DynamicStringSchema,
        child: ComponentIdSchema,
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A collapsible section: a title that expands to show its child.'),
  };
}
