<script setup lang="ts">
  import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

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
