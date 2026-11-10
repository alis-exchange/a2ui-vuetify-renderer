/**
 * ComponentApi schema for A2UIBanner.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Banner API for one protocol family; see {@link ProtocolKit}. */
export function buildBannerApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'Banner',
    schema: z
      .object({
        text: DynamicStringSchema,
        icon: DynamicStringSchema.optional(),
        child: ComponentIdSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A full-width notice with text and an optional icon.'),
  };
}
