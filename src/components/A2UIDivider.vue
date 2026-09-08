<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const isVertical = computed(() => {
    const axis = resolveValue<string | undefined>(props.node.properties.axis);
    return axis === 'vertical';
  });
</script>

<template>
  <v-divider :vertical="isVertical"></v-divider>
</template>
