/**
 * ComponentApi schema for A2UITimePicker.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the TimePicker API for one protocol family; see {@link ProtocolKit}. */
export function buildTimePickerApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicStringSchema } = kit;
  return {
    name: 'TimePicker',
    schema: z
      .object({
        label: DynamicStringSchema.optional(),
        value: DynamicStringSchema,
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A time input bound to a HH:MM value.'),
  };
}

/** The TimePicker API for A2UI v0.9 / v0.9.1. */
export const TimePickerApi: ComponentApi = buildTimePickerApi(A2UI_V09);
