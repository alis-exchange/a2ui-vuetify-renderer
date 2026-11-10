/**
 * ComponentApi schema for A2UIVideo.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Video API for one protocol family; see {@link ProtocolKit}. */
export function buildVideoApi(kit: ProtocolKit): ComponentApi {
  const { DynamicBooleanSchema, DynamicStringSchema } = kit;
  return {
    name: 'Video',
    schema: z
      .object({
        url: DynamicStringSchema,
        autoplay: DynamicBooleanSchema.optional(),
        controls: DynamicBooleanSchema.optional(),
        loop: DynamicBooleanSchema.optional(),
        muted: DynamicBooleanSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A video player for a URL.'),
  };
}
