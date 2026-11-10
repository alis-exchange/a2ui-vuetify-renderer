/**
 * ComponentApi schema for A2UIChip.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Chip API for one protocol family; see {@link ProtocolKit}. */
export function buildChipApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'Chip',
    schema: z
      .object({
        ...kit.commonProps,
        text: DynamicStringSchema.optional(),
        child: ComponentIdSchema.optional(),
      })
      .strict(),
  };
}

/** The Chip API for A2UI v0.9 / v0.9.1. */
export const ChipApi: ComponentApi = buildChipApi(A2UI_V09);
