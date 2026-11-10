/**
 * ComponentApi schema for A2UICheckbox.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Checkbox API for one protocol family; see {@link ProtocolKit}. */
export function buildCheckboxApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicBooleanSchema, DynamicStringSchema } = kit;
  return {
    name: 'Checkbox',
    schema: z
      .object({
        ...kit.commonProps,
        label: DynamicStringSchema,
        value: DynamicBooleanSchema,
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
  };
}

/** The Checkbox API for A2UI v0.9 / v0.9.1. */
export const CheckboxApi: ComponentApi = buildCheckboxApi(A2UI_V09);
