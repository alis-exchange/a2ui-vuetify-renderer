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
  const type = computed(() => resolveValue(props.node.properties.variant) || 'info'); // success, info, warning, error
  const child = computed(() => {
    const c = resolveValue(props.node.properties.child);
    if (typeof c === 'string') return c;
    if (c && typeof c === 'object' && c.id) return c.id;
    return undefined;
  });
</script>

<script lang="ts">
  import type { ComponentApi } from '@a2ui/web_core/v0_9';
  import { ComponentIdSchema, DynamicStringSchema } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const AlertApi: ComponentApi = {
    name: 'Alert',
    schema: z
      .object({
        ...CommonProps,
        title: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        variant: z.enum(['success', 'info', 'warning', 'error']).default('info').optional(),
        child: ComponentIdSchema.optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-alert
    :title="title"
    :text="text"
    :type="type"
  >
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-alert>
</template>
