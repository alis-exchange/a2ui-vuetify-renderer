/**
 * ComponentApi schema for A2UIIcon.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Icon API for one protocol family; see {@link ProtocolKit}. */
export function buildIconApi(kit: ProtocolKit): ComponentApi {
  return {
    name: 'Icon',
    schema: z
      .object({
        name: z.union([z.string(), kit.PathBinding]),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A Material Design icon, by name.'),
  };
}
