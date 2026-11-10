/**
 * ComponentApi schema for A2UIImage.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Image API for one protocol family; see {@link ProtocolKit}. */
export function buildImageApi(kit: ProtocolKit): ComponentApi {
  const { DynamicStringSchema } = kit;
  return {
    name: 'Image',
    schema: z
      .object({
        url: DynamicStringSchema,
        description: DynamicStringSchema.optional(),
        fit: z.enum(['contain', 'cover', 'fill', 'none', 'scaleDown']).default('fill').optional(),
        variant: z.enum(['icon', 'avatar', 'smallFeature', 'mediumFeature', 'largeFeature', 'header']).default('mediumFeature').optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('An image loaded from a URL, sized by variant (icon, avatar, feature, header).'),
  };
}

/** The Image API for A2UI v0.9 / v0.9.1. */
export const ImageApi: ComponentApi = buildImageApi(A2UI_V09);
