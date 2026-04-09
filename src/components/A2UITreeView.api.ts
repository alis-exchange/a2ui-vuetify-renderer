/**
 * ComponentApi schema for A2UITreeView.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const TreeViewApi: ComponentApi = {
  name: 'TreeView',
  schema: z
    .object({
      ...CommonProps,
      items: z.array(z.any()),
    })
    .strict(),
};
