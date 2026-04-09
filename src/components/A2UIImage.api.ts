/**
 * ComponentApi schema for A2UIImage.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const ImageApi: ComponentApi = {
  name: 'Image',
  schema: z
    .object({
      ...CommonProps,
      url: DynamicStringSchema,
      description: DynamicStringSchema.optional(),
      fit: z.enum(['contain', 'cover', 'fill', 'none', 'scaleDown']).default('fill').optional(),
      variant: z.enum(['icon', 'avatar', 'smallFeature', 'mediumFeature', 'largeFeature', 'header']).default('mediumFeature').optional(),
    })
    .strict(),
};
