<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import A2UIRadioButton from './A2UIRadioButton.vue';
  import A2UISegmentedChoice from './A2UISegmentedChoice.vue';
  import A2UISelect from './A2UISelect.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  // ChoicePicker is an A2UI concept that wraps the intent of a choice.
  // We map it to the underlying Vuetify component implementations we already have.

  // Resolve only the two props that pick the delegate. Resolving every prop (useDynamicProps)
  // would actively evaluate `action` and `checks` on each render, so an `openUrl` call in them
  // would fire whenever a user gesture happened to be active.
  const resolvedComponent = computed(() => {
    const variant = resolveValue<string>(props.node.properties.variant) || 'mutuallyExclusive';
    const displayStyle = resolveValue<string>(props.node.properties.displayStyle) || 'dropdown';

    if (displayStyle === 'segmented') {
      return A2UISegmentedChoice;
    }

    if (displayStyle === 'list') {
      if (variant === 'mutuallyExclusive') {
        return A2UIRadioButton;
      }
      // If it's multiple selection list, ideally we'd map it to a group of checkboxes.
      // For now, A2UISelect is our most capable multi-select component.
      // Future enhancement: A2UIMultipleCheckbox for displayStyle='list' & variant='multipleSelection'.
      return A2UISelect;
    }

    // displayStyle 'dropdown' (the default).
    return A2UISelect;
  });
</script>

<template>
  <component
    :is="resolvedComponent"
    :node="node"
  />
</template>
