/**
 * ComponentApi schema for A2UITextField.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the TextField API for one protocol family; see {@link ProtocolKit}. */
export function buildTextFieldApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicStringSchema } = kit;
  return {
    name: 'TextField',
    schema: z
      .object({
        ...kit.commonProps,
        label: DynamicStringSchema,
        value: DynamicStringSchema.optional(),
        variant: z.enum(['filled', 'outlined', 'underlined']).default('outlined').optional(),
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
  };
}

/** The TextField API for A2UI v0.9 / v0.9.1. */
export const TextFieldApi: ComponentApi = buildTextFieldApi(A2UI_V09);
