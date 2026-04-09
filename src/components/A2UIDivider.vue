<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import type { ComponentModel } from '../types';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const isVertical = computed(() => {
    const axis = resolveValue(props.node.properties.axis);
    return axis === 'vertical';
  });
</script>

<template>
  <v-divider :vertical="isVertical"></v-divider>
</template>
