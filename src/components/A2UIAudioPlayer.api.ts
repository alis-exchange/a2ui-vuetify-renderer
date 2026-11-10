/**
 * ComponentApi schema for A2UIAudioPlayer.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the AudioPlayer API for one protocol family; see {@link ProtocolKit}. */
export function buildAudioPlayerApi(kit: ProtocolKit): ComponentApi {
  const { DynamicBooleanSchema, DynamicStringSchema } = kit;
  return {
    name: 'AudioPlayer',
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

/** The AudioPlayer API for A2UI v0.9 / v0.9.1. */
export const AudioPlayerApi: ComponentApi = buildAudioPlayerApi(A2UI_V09);
