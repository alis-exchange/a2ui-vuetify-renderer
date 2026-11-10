/**
 * ComponentApi schema for A2UIVideo.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Video API for one protocol family; see {@link ProtocolKit}. */
export function buildVideoApi(kit: ProtocolKit): ComponentApi {
  const { DynamicBooleanSchema, DynamicStringSchema } = kit;
  return {
    name: 'Video',
    schema: z
      .object({
        ...kit.commonProps,
        url: DynamicStringSchema,
        autoplay: DynamicBooleanSchema.optional(),
        controls: DynamicBooleanSchema.optional(),
        loop: DynamicBooleanSchema.optional(),
        muted: DynamicBooleanSchema.optional(),
      })
      .strict(),
  };
}

/** The Video API for A2UI v0.9 / v0.9.1. */
export const VideoApi: ComponentApi = buildVideoApi(A2UI_V09);
