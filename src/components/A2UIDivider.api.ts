/**
 * ComponentApi schema for A2UIDivider.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Divider API for one protocol family; see {@link ProtocolKit}. */
export function buildDividerApi(kit: ProtocolKit): ComponentApi {
  return {
    name: 'Divider',
    schema: z
      .object({
        ...kit.commonProps,
        axis: z.enum(['horizontal', 'vertical']).default('horizontal').optional(),
      })
      .strict(),
  };
}

/** The Divider API for A2UI v0.9 / v0.9.1. */
export const DividerApi: ComponentApi = buildDividerApi(A2UI_V09);
