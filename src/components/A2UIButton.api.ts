/**
 * ComponentApi schema for A2UIButton.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Button API for one protocol family; see {@link ProtocolKit}. */
export function buildButtonApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicStringSchema } = kit;
  return {
    name: 'Button',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        icon: DynamicStringSchema.optional(),
        variant: z.enum(['default', 'primary', 'borderless']).default('default').optional(),
        action: ActionSchema,
        checks: CheckableSchema.shape.checks,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      // No refine(): a ZodEffects root hides the shape from web_core's binder (every prop would
      // become static, losing action closures and isValid). Agents should still send at least one
      // of label, text or icon; the JSON catalog could never express that rule anyway.
      .strict()
      .describe('A clickable button with a label, text and/or icon that runs an action; disabled while its checks fail.'),
  };
}
