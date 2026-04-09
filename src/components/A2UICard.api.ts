/**
 * ComponentApi schema for A2UICard.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ComponentIdSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const CardApi: ComponentApi = {
  name: 'Card',
  schema: z
    .object({
      ...CommonProps,
      child: ComponentIdSchema,
    })
    .strict(),
};
