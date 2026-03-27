<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue } = useA2UI();

const iconName = computed(() => {
  const name = resolveValue(props.node.properties.name) ?? '';
  // Map A2UI icon names to mdi if they don't have a prefix
  if (name && !name.startsWith('mdi-')) {
    return `mdi-${name}`;
  }
  return name;
});
</script>

<template>
  <v-icon :icon="iconName"></v-icon>
</template>
