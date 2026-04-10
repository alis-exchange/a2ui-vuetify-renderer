<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const content = computed(() => resolveValue<string | number | undefined>(props.node.properties.content));
  const color = computed(() => resolveValue<string | undefined>(props.node.properties.color) || 'primary');
  const child = computed(() => resolveValue<string | undefined>(props.node.properties.child));
</script>

<template>
  <v-badge
    :content="content"
    :color="color"
  >
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-badge>
</template>
