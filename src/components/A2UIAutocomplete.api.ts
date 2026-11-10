/**
 * ComponentApi schema for A2UIAutocomplete.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ActionSchema, DynamicStringSchema, DynamicValueSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const AutocompleteApi: ComponentApi = {
  name: 'Autocomplete',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(z.any()),
      // DynamicValue, not a plain union: it carries the DynamicValue ref web_core's binder needs to
      // treat the prop as bindable (accept { path } and generate setValue).
      value: DynamicValueSchema,
      variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
};
