<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import type { ComponentModel } from '../types';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveDynamicChildren } = useA2UI();

  const resolvedChildren = computed(() => {
    return resolveDynamicChildren(props.node.properties.children);
  });
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
