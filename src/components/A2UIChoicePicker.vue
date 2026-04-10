<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useDynamicProps } from '../composables/useDynamicProps';
  import A2UIRadioButton from './A2UIRadioButton.vue';
  import A2UISelect from './A2UISelect.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const dynamicProps = useDynamicProps(() => props.node);

  // ChoicePicker is an A2UI concept that wraps the intent of a choice.
  // We map it to the underlying Vuetify component implementations we already have.

  const resolvedComponent = computed(() => {
    const variant = dynamicProps.value.variant || 'mutuallyExclusive';
    const displayStyle = dynamicProps.value.displayStyle || 'dropdown';

    if (displayStyle === 'list') {
      if (variant === 'mutuallyExclusive') {
        return A2UIRadioButton;
      }
      // If it's multiple selection list, ideally we'd map it to a group of checkboxes.
      // For now, A2UISelect is our most capable multi-select component.
      // Future enhancement: A2UIMultipleCheckbox for displayStyle='list' & variant='multipleSelection'.
      return A2UISelect;
    }

    // segmented buttons not explicitly built yet, fallback to Select
    return A2UISelect;
  });
</script>

<template>
  <component
    :is="resolvedComponent"
    :node="node"
  />
</template>
