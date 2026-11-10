/**
 * ComponentApi schema for A2UIIconButton.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the IconButton API for one protocol family; see {@link ProtocolKit}. */
export function buildIconButtonApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicStringSchema } = kit;
  return {
    name: 'IconButton',
    schema: z
      .object({
        icon: DynamicStringSchema,
        variant: z.enum(['default', 'primary', 'borderless']).default('default').optional(),
        action: ActionSchema,
        checks: CheckableSchema.shape.checks,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A compact button showing only an icon that runs an action.'),
  };
}

/** The IconButton API for A2UI v0.9 / v0.9.1. */
export const IconButtonApi: ComponentApi = buildIconButtonApi(A2UI_V09);
