<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import type { ComponentModel } from '@a2ui/web_core/v0_9';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const childId = computed(() => resolveValue<string | undefined>(props.node.properties.child));
</script>

<template>
  <v-card>
    <ComponentNode
      v-if="childId"
      :id="childId"
    />
  </v-card>
</template>
