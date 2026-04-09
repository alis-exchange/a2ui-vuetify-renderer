/**
 * ComponentApi schema for A2UICalendar.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const CalendarApi: ComponentApi = {
  name: 'Calendar',
  schema: z
    .object({
      ...CommonProps,
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
    })
    .strict(),
};
