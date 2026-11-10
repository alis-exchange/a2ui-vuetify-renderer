/**
 * ComponentApi schema for A2UITreeView.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import type { ProtocolKit } from '../protocol/kits';

/** Builds the TreeView API for one protocol family; see {@link ProtocolKit}. */
export function buildTreeViewApi(kit: ProtocolKit): ComponentApi {
  return {
    name: 'TreeView',
    schema: z
      .object({
        items: z.array(z.any()),
        // Shared props last: Express maps positional arguments in declaration order.
        ...kit.commonProps,
      })
      .strict()
      .describe('A flat list of item titles (top-level items only; nested children are not shown).'),
  };
}
