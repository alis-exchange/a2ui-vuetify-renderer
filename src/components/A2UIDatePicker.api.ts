/**
 * ComponentApi schema for A2UIDatePicker.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the DatePicker API for one protocol family; see {@link ProtocolKit}. */
export function buildDatePickerApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, CheckableSchema, DynamicBooleanSchema, DynamicStringSchema } = kit;
  return {
    name: 'DatePicker',
    schema: z
      .object({
        ...kit.commonProps,
        label: DynamicStringSchema.optional(),
        value: DynamicStringSchema,
        min: DynamicStringSchema.optional(),
        max: DynamicStringSchema.optional(),
        color: z.string().optional(),
        multiple: z.union([z.boolean(), z.literal('range')]).optional(),
        readonly: DynamicBooleanSchema.optional(),
        disabled: DynamicBooleanSchema.optional(),
        landscape: DynamicBooleanSchema.optional(),
        showAdjacentMonths: DynamicBooleanSchema.optional(),
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
  };
}

/** The DatePicker API for A2UI v0.9 / v0.9.1. */
export const DatePickerApi: ComponentApi = buildDatePickerApi(A2UI_V09);
