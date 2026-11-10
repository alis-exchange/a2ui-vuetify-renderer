/**
 * ComponentApi schema for A2UIList.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the List API for one protocol family; see {@link ProtocolKit}. */
export function buildListApi(kit: ProtocolKit): ComponentApi {
  const { ChildListSchema } = kit;
  return {
    name: 'List',
    schema: z
      .object({
        ...kit.commonProps,
        children: ChildListSchema,
        direction: z.enum(['vertical', 'horizontal']).default('vertical').optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
      })
      .strict(),
  };
}

/** The List API for A2UI v0.9 / v0.9.1. */
export const ListApi: ComponentApi = buildListApi(A2UI_V09);
