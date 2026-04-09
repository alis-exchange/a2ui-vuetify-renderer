/**
 * ComponentApi schema for A2UIAvatar.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const AvatarApi: ComponentApi = {
  name: 'Avatar',
  schema: z
    .object({
      ...CommonProps,
      image: DynamicStringSchema.optional(),
      text: DynamicStringSchema.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
};
