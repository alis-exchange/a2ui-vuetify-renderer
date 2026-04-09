<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import type { ComponentModel } from '../types';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const items = computed(() => resolveValue(props.node.properties.items) || []);
</script>

<template>
  <!-- Basic fallback for TreeView as v-treeview may not be natively in core Vuetify 3/4 without labs -->
  <v-list>
    <v-list-item
      v-for="(item, index) in items"
      :key="index"
      :title="item.title || item.name || String(item)"
    ></v-list-item>
  </v-list>
</template>
