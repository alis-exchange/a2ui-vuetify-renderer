/**
 * ComponentApi schema for A2UIColumn.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Column API for one protocol family; see {@link ProtocolKit}. */
export function buildColumnApi(kit: ProtocolKit): ComponentApi {
  const { ChildListSchema } = kit;
  return {
    name: 'Column',
    schema: z
      .object({
        ...kit.commonProps,
        children: ChildListSchema,
        justify: z.enum(['start', 'center', 'end', 'spaceBetween', 'spaceAround', 'spaceEvenly', 'stretch']).default('start').optional(),
        align: z.enum(['center', 'end', 'start', 'stretch']).default('stretch').optional(),
      })
      .strict(),
  };
}

/** The Column API for A2UI v0.9 / v0.9.1. */
export const ColumnApi: ComponentApi = buildColumnApi(A2UI_V09);
