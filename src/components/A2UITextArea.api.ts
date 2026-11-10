/**
 * ComponentApi schema for A2UITextArea.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the TextArea API for one protocol family; see {@link ProtocolKit}. */
export function buildTextAreaApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicStringSchema } = kit;
  return {
    name: 'TextArea',
    schema: z
      .object({
        label: DynamicStringSchema,
        value: DynamicStringSchema.optional(),
        variant: z.enum(['filled', 'outlined', 'underlined']).default('outlined').optional(),
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A multi-line text input bound to the data model.'),
  };
}

/** The TextArea API for A2UI v0.9 / v0.9.1. */
export const TextAreaApi: ComponentApi = buildTextAreaApi(A2UI_V09);
