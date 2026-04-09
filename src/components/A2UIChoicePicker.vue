<script setup lang="ts">
  import { computed } from 'vue';
  import { useDynamicProps } from '../composables/useDynamicProps';
  import A2UIRadioButton from './A2UIRadioButton.vue';
  import A2UISelect from './A2UISelect.vue';

  const props = defineProps<{
    node: any;
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

<script lang="ts">
  import { CheckableSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const ChoicePickerApi: ComponentApi = {
    name: 'ChoicePicker',
    schema: z
      .object({
        ...CommonProps,
        label: DynamicStringSchema.optional(),
        options: z.array(z.any()),
        value: z.union([z.string(), z.array(z.any())]),
        variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
        displayStyle: z.enum(['list', 'dropdown', 'segmented']).default('dropdown').optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
  };
</script>

<template>
  <component
    :is="resolvedComponent"
    :node="node"
  />
</template>
