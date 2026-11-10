/**
 * ComponentApi schema for A2UIFileInput.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the FileInput API for one protocol family; see {@link ProtocolKit}. */
export function buildFileInputApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicStringSchema, DynamicValueSchema } = kit;
  return {
    name: 'FileInput',
    schema: z
      .object({
        label: DynamicStringSchema,
        value: DynamicValueSchema.optional(),
        action: ActionSchema.optional(),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A file chooser that stores the selected files.'),
  };
}

/** The FileInput API for A2UI v0.9 / v0.9.1. */
export const FileInputApi: ComponentApi = buildFileInputApi(A2UI_V09);
