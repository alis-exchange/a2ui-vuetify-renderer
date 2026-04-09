<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveDynamicChildren } = useA2UI();

  const resolvedChildren = computed(() => {
    return resolveDynamicChildren(props.node.properties.children);
  });
</script>

<script lang="ts">
  import { ChildListSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const ListApi: ComponentApi = {
    name: 'List',
    schema: z
      .object({
        ...CommonProps,
        children: ChildListSchema,
        direction: z.enum(['vertical', 'horizontal']).default('vertical').optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-list>
    <ComponentNode
      v-for="(child, index) in resolvedChildren"
      :key="child.id + index"
      :id="child.id"
      :path="child.path"
    />
  </v-list>
</template>
