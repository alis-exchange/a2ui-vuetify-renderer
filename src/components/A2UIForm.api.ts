/**
 * ComponentApi schema for A2UIForm.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the Form API for one protocol family; see {@link ProtocolKit}. */
export function buildFormApi(kit: ProtocolKit): ComponentApi {
  const { ChildListSchema } = kit;
  return {
    name: 'Form',
    schema: z
      .object({
        children: ChildListSchema,
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A container that groups related input components into one form.'),
  };
}
