/**
 * ComponentApi schema for A2UICalendar.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Calendar API for one protocol family; see {@link ProtocolKit}. */
export function buildCalendarApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicStringSchema } = kit;
  return {
    name: 'Calendar',
    schema: z
      .object({
        events: z.array(
          z
            .object({
              name: z.string(),
              start: z.string(),
              end: z.string().optional(),
              color: z.string().optional(),
              timed: z.boolean().optional(),
            })
            .strict(),
        ),
        type: z.enum(['month', 'week', 'day', '4day', 'custom-weekly', 'custom-daily', 'category']).default('month').optional(),
        value: DynamicStringSchema.optional(),
        weekdays: z.array(z.number()).optional(),
        color: z.string().optional(),
        eventColor: z.string().optional(),
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A month, week or day calendar showing events; clicking a date selects it.'),
  };
}

/** The Calendar API for A2UI v0.9 / v0.9.1. */
export const CalendarApi: ComponentApi = buildCalendarApi(A2UI_V09);
