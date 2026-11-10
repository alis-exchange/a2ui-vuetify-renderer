/**
 * ComponentApi schema for A2UIModal.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Modal API for one protocol family; see {@link ProtocolKit}. */
export function buildModalApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, ComponentIdSchema, DynamicBooleanSchema } = kit;
  return {
    name: 'Modal',
    schema: z
      .object({
        trigger: ComponentIdSchema,
        content: ComponentIdSchema,
        open: DynamicBooleanSchema.optional(),
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A dialog: clicking the trigger opens the content in an overlay.'),
  };
}

/** The Modal API for A2UI v0.9 / v0.9.1. */
export const ModalApi: ComponentApi = buildModalApi(A2UI_V09);
