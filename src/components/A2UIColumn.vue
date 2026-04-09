<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, resolveDynamicChildren } = useA2UI();

  const justifyClass = computed(() => {
    const justify = resolveValue(props.node.properties.justify);
    switch (justify) {
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'spaceBetween':
        return 'justify-space-between';
      case 'spaceAround':
        return 'justify-space-around';
      case 'start':
      default:
        return 'justify-start';
    }
  });

  const alignClass = computed(() => {
    const align = resolveValue(props.node.properties.align);
    switch (align) {
      case 'start':
        return 'align-start';
      case 'end':
        return 'align-end';
      case 'center':
        return 'align-center';
      case 'baseline':
        return 'align-baseline';
      case 'stretch':
      default:
        return 'align-stretch';
    }
  });

  const children = computed(() => {
    return resolveDynamicChildren(props.node.properties.children);
  });
</script>

<script lang="ts">
  import { ChildListSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const ColumnApi: ComponentApi = {
    name: 'Column',
    schema: z
      .object({
        ...CommonProps,
        children: ChildListSchema,
        justify: z.enum(['start', 'center', 'end', 'spaceBetween', 'spaceAround', 'spaceEvenly', 'stretch']).default('start').optional(),
        align: z.enum(['center', 'end', 'start', 'stretch']).default('stretch').optional(),
      })
      .strict(),
  };
</script>

<template>
  <div
    :class="['d-flex', 'flex-column', justifyClass, alignClass]"
    style="width: 100%"
  >
    <ComponentNode
      v-for="(child, index) in children"
      :key="child.id + index"
      :id="child.id"
      :path="child.path"
    />
  </div>
</template>
