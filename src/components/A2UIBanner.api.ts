/**
 * ComponentApi schema for A2UIBanner.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const BannerApi: ComponentApi = {
  name: 'Banner',
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema,
      icon: DynamicStringSchema.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
};
