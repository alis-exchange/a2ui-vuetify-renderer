import { AccessibilityAttributesSchema } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

/**
 * Shared Zod property schemas available to all component API definitions.
 *
 * These are spread into individual component schemas so that common properties
 * like `accessibility` and `weight` don't need to be redefined per component.
 */
export const CommonProps = {
  accessibility: AccessibilityAttributesSchema.optional(),
  weight: z.number().describe("The relative weight of this component within a Row or Column. Similar to CSS 'flex-grow'.").optional(),
};
