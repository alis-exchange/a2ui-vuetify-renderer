<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { ComponentModel } from '@a2ui/web_core/v0_9/state/component-model';
import ComponentNode from '../core/ComponentNode.vue';

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue, resolveDynamicChildren } = useA2UI();

const resolvedChildren = computed(() => {
  return resolveDynamicChildren(props.node.properties.children);
});
</script>

<template>
  <v-list>
    <ComponentNode
      v-for="(child, index) in resolvedChildren"
      :key="child.id + index"
      :id="child.id"
      :path="child.path"
    />
  </v-list>
</template>
