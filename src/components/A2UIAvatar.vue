<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import type { ComponentModel } from '@a2ui/web_core/v0_9';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const image = computed(() => resolveValue<string | undefined>(props.node.properties.image));
  const text = computed(() => resolveValue<string | undefined>(props.node.properties.text));
  const child = computed(() => resolveValue<string | undefined>(props.node.properties.child));
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
