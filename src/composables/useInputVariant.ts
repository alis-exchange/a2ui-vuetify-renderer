import type { ComponentModel } from '@a2ui/web_core/v0_9';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { useA2UI } from './useA2UI';

/** The Vuetify text-input variants the catalog's `variant` enum maps onto. */
export type InputVariant = 'filled' | 'outlined' | 'underlined';

/**
 * Maps a text input's `variant` property (TextField, TextArea, NumberInput) to the Vuetify
 * variant, defaulting to `underlined`.
 *
 * @param node - The component node, as a ref, getter, or plain object.
 */
export function useInputVariant(node: MaybeRefOrGetter<ComponentModel>): ComputedRef<InputVariant> {
  const { resolveValue } = useA2UI();
  return computed(() => {
    const variant = resolveValue<string | undefined>(toValue(node).properties.variant);
    return variant === 'filled' || variant === 'outlined' ? variant : 'underlined';
  });
}
