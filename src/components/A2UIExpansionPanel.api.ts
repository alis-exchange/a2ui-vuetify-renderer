/**
 * ComponentApi schema for A2UIExpansionPanel.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the ExpansionPanel API for one protocol family; see {@link ProtocolKit}. */
export function buildExpansionPanelApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'ExpansionPanel',
    schema: z
      .object({
        ...kit.commonProps,
        title: DynamicStringSchema,
        child: ComponentIdSchema,
        action: ActionSchema.optional(),
      })
      .strict(),
  };
}

/** The ExpansionPanel API for A2UI v0.9 / v0.9.1. */
export const ExpansionPanelApi: ComponentApi = buildExpansionPanelApi(A2UI_V09);
