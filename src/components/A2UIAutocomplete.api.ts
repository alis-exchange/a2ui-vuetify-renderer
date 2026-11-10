/**
 * ComponentApi schema for A2UIAutocomplete.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { A2UI_V09, type ProtocolKit } from '../protocol/kits';

/** Builds the Autocomplete API for one protocol family; see {@link ProtocolKit}. */
export function buildAutocompleteApi(kit: ProtocolKit): ComponentApi {
  const { ActionSchema, DynamicStringSchema, DynamicValueSchema } = kit;
  return {
    name: 'Autocomplete',
    schema: z
      .object({
        ...kit.commonProps,
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
}

/** The Autocomplete API for A2UI v0.9 / v0.9.1. */
export const AutocompleteApi: ComponentApi = buildAutocompleteApi(A2UI_V09);
