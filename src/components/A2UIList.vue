<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, resolveDynamicChildren } = useA2UI();

  const resolvedChildren = computed(() => {
    return resolveDynamicChildren(props.node.properties.children);
  });

  const horizontal = computed(() => resolveValue<string | undefined>(props.node.properties.direction) === 'horizontal');

  // `align` places items across the list: horizontally in a vertical list, vertically in a
  // horizontal one. Default stretch, as the schema declares.
  const alignClass = computed(() => {
    switch (resolveValue<string | undefined>(props.node.properties.align)) {
      case 'start':
        return 'align-start';
      case 'center':
        return 'align-center';
      case 'end':
        return 'align-end';
      default:
        return 'align-stretch';
    }
  });

  // A horizontal list scrolls rather than pushing the page wider.
  const listClass = computed(() => ['d-flex', horizontal.value ? 'flex-row overflow-x-auto ga-2' : 'flex-column', alignClass.value]);
</script>

<template>
  <v-list :class="listClass">
    <ComponentNode
      v-for="(child, index) in resolvedChildren"
      :key="child.id + index"
      :id="child.id"
      :path="child.path"
    />
  </v-list>
</template>
