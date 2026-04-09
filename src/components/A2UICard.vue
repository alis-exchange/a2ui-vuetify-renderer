<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const childId = computed(() => {
    const c = resolveValue(props.node.properties.child);
    if (typeof c === 'string') return c;
    if (c && typeof c === 'object' && c.id) return c.id;
    return undefined;
  });
</script>

<script lang="ts">
  import { ComponentIdSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const CardApi: ComponentApi = {
    name: 'Card',
    schema: z
      .object({
        ...CommonProps,
        child: ComponentIdSchema,
      })
      .strict(),
  };
</script>

<template>
  <v-card>
    <ComponentNode
      v-if="childId"
      :id="childId"
    />
  </v-card>
</template>
