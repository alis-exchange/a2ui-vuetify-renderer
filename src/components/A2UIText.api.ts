/**
 * ComponentApi schema for A2UIText.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const TextApi: ComponentApi = {
  name: 'Text',
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema,
      variant: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'caption', 'body']).default('body').optional(),
    })
    .strict(),
};
