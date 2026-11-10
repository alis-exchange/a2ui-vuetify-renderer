/**
 * ComponentApi schema for A2UIText.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Text API for one protocol family; see {@link ProtocolKit}. */
export function buildTextApi(kit: ProtocolKit): ComponentApi {
  const { DynamicStringSchema } = kit;
  return {
    name: 'Text',
    schema: z
      .object({
        text: DynamicStringSchema,
        variant: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'caption', 'body']).default('body').optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A run of text: headings (h1-h5), body copy or a caption.'),
  };
}

/** The Text API for A2UI v0.9 / v0.9.1. */
export const TextApi: ComponentApi = buildTextApi(A2UI_V09);
