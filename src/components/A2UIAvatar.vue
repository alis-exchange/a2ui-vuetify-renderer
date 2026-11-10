<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import { safeMediaUrl } from '../utils/mediaUrl';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const image = computed(() => safeMediaUrl(resolveValue<string | undefined>(props.node.properties.image)));
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
