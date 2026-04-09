/**
 * ComponentApi schema for A2UIAutocomplete.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const AutocompleteApi: ComponentApi = {
  name: 'Autocomplete',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(z.any()),
      value: z.union([z.string(), z.array(z.any())]),
      variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
};
