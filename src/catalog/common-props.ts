import { AccessibilityAttributesSchema } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

export const CommonProps = {
  accessibility: AccessibilityAttributesSchema.optional(),
  weight: z.number().describe("The relative weight of this component within a Row or Column. Similar to CSS 'flex-grow'.").optional(),
};
