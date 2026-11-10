/**
 * ComponentApi schema for A2UIEmptyState.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the EmptyState API for one protocol family; see {@link ProtocolKit}. */
export function buildEmptyStateApi(kit: ProtocolKit): ComponentApi {
  const { ComponentIdSchema, DynamicStringSchema } = kit;
  return {
    name: 'EmptyState',
    schema: z
      .object({
        ...kit.commonProps,
        title: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        icon: DynamicStringSchema.optional(),
        child: ComponentIdSchema.optional(),
      })
      .strict(),
  };
}

/** The EmptyState API for A2UI v0.9 / v0.9.1. */
export const EmptyStateApi: ComponentApi = buildEmptyStateApi(A2UI_V09);
