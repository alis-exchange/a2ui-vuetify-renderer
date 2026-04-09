<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const items = computed(() => resolveValue(props.node.properties.items) || []);
</script>

<script lang="ts">
  import type { ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const TreeViewApi: ComponentApi = {
    name: 'TreeView',
    schema: z
      .object({
        ...CommonProps,
        items: z.array(z.any()),
      })
      .strict(),
  };
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
