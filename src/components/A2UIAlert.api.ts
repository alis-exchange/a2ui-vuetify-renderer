/**
 * ComponentApi schema for A2UIAlert.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Alert API for one protocol family; see {@link ProtocolKit}. */
export function buildAlertApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'Alert',
    schema: z
      .object({
        title: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        variant: z.enum(['success', 'info', 'warning', 'error']).default('info').optional(),
        child: ComponentIdSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A coloured message box for success, info, warning or error notices.'),
  };
}
