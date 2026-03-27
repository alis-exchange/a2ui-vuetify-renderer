<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue } = useA2UI();

const items = computed(() => {
  const resolved = resolveValue(props.node.properties.items);
  return Array.isArray(resolved) ? resolved : [];
});

const headers = computed(() => {
  const resolved = resolveValue(props.node.properties.columns);
  if (Array.isArray(resolved)) {
    return resolved.map(c => ({ title: c.title || c, key: c.key || c }));
  }
  // Auto generate headers from first item if not provided
  if (items.value.length > 0) {
    return Object.keys(items.value[0]).map(key => ({ title: key, key }));
  }
  return [];
});
</script>

<template>
  <v-data-table
    v-if="items.length > 0"
    :headers="headers"
    :items="items"
  ></v-data-table>
  <div v-else>No Data</div>
</template>
