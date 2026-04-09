<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import type { ComponentModel } from '../types';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const text = computed(() => resolveValue(props.node.properties.text));
  const icon = computed(() => resolveValue(props.node.properties.icon));

  // A2UI uses 'actions' array in Banner potentially, but typical is just text
  // We render child if provided
  const child = computed(() => {
    const c = resolveValue(props.node.properties.child);
    if (typeof c === 'string') return c;
    if (c && typeof c === 'object' && c.id) return c.id;
    return undefined;
  });
</script>

<template>
  <v-banner
    :text="text"
    :icon="icon"
  >
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-banner>
</template>
