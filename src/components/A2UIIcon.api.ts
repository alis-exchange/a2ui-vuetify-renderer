/**
 * ComponentApi schema for A2UIIcon.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const IconApi: ComponentApi = {
  name: 'Icon',
  schema: z
    .object({
      ...CommonProps,
      name: z.union([z.string(), z.object({ path: z.string() })]),
    })
    .strict(),
};
