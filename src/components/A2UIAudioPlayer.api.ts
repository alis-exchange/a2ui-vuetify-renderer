/**
 * ComponentApi schema for A2UIAudioPlayer.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { DynamicBooleanSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const AudioPlayerApi: ComponentApi = {
  name: 'AudioPlayer',
  schema: z
    .object({
      ...CommonProps,
      url: DynamicStringSchema,
      autoplay: DynamicBooleanSchema.optional(),
      controls: DynamicBooleanSchema.optional(),
      loop: DynamicBooleanSchema.optional(),
      muted: DynamicBooleanSchema.optional(),
    })
    .strict(),
};
