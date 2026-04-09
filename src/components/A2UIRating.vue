<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const max = computed(() => resolveValue(props.node.properties.max) || 5);
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue(props.node.properties.value) || 0;
    },
    set(val: number) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
      dispatchNodeAction(props.node, { value: val });
    },
  });
</script>

<script lang="ts">
  import { ActionSchema, DynamicNumberSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const RatingApi: ComponentApi = {
    name: 'Rating',
    schema: z
      .object({
        ...CommonProps,
        max: z.number().default(5).optional(),
        value: DynamicNumberSchema,
        action: ActionSchema.optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-rating
    v-model="modelValue"
    :length="max"
  ></v-rating>
</template>
