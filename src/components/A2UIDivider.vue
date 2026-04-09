<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const isVertical = computed(() => {
    const axis = resolveValue(props.node.properties.axis);
    return axis === 'vertical';
  });
</script>

<script lang="ts">
  import type { ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const DividerApi: ComponentApi = {
    name: 'Divider',
    schema: z
      .object({
        ...CommonProps,
        axis: z.enum(['horizontal', 'vertical']).default('horizontal').optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-divider :vertical="isVertical"></v-divider>
</template>
