/**
 * ComponentApi schema for A2UIAvatar.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Avatar API for one protocol family; see {@link ProtocolKit}. */
export function buildAvatarApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'Avatar',
    schema: z
      .object({
        image: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        child: ComponentIdSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A round image, initials or icon representing a person or entity.'),
  };
}

/** The Avatar API for A2UI v0.9 / v0.9.1. */
export const AvatarApi: ComponentApi = buildAvatarApi(A2UI_V09);
