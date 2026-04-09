<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const title = computed(() => resolveValue(props.node.properties.title));
  const text = computed(() => resolveValue(props.node.properties.text));
  const icon = computed(() => resolveValue(props.node.properties.icon));

  const child = computed(() => {
    const c = resolveValue(props.node.properties.child);
    if (typeof c === 'string') return c;
    if (c && typeof c === 'object' && c.id) return c.id;
    return undefined;
  });
</script>

<script lang="ts">
  import { ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const EmptyStateApi: ComponentApi = {
    name: 'EmptyState',
    schema: z
      .object({
        ...CommonProps,
        title: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        icon: DynamicStringSchema.optional(),
        child: ComponentIdSchema.optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-empty-state
    :title="title"
    :text="text"
    :icon="icon"
  >
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-empty-state>
</template>
