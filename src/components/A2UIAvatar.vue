<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const image = computed(() => resolveValue(props.node.properties.image));
  const text = computed(() => resolveValue(props.node.properties.text));
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

  export const AvatarApi: ComponentApi = {
    name: 'Avatar',
    schema: z
      .object({
        ...CommonProps,
        image: DynamicStringSchema.optional(),
        text: DynamicStringSchema.optional(),
        child: ComponentIdSchema.optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-avatar :image="image">
    <template v-if="text">{{ text }}</template>
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-avatar>
</template>
