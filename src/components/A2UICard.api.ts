/**
 * ComponentApi schema for A2UICard.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Card API for one protocol family; see {@link ProtocolKit}. */
export function buildCardApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema } = kit;
  return {
    name: 'Card',
    schema: z
      .object({
        child: ComponentIdSchema,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A raised container for one child, used to group related content.'),
  };
}

/** The Card API for A2UI v0.9 / v0.9.1. */
export const CardApi: ComponentApi = buildCardApi(A2UI_V09);
