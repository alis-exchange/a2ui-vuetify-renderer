<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import type { ComponentModel } from '../types';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const image = computed(() => resolveValue(props.node.properties.image));
  const text = computed(() => resolveValue(props.node.properties.text));
  const child = computed(() => {
    const c = resolveValue(props.node.properties.child);
    if (typeof c === 'string') return c;
    if (c && typeof c === 'object' && c.id) return c.id;
    return undefined;
  });
</script>

<template>
  <v-avatar :image="image">
    <template v-if="text">{{ text }}</template>
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-avatar>
</template>
