<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveDynamicChildren } = useA2UI();

  // Same handling as every other container: `resolveDynamicChildren` covers both a static id list
  // and a `{componentId, path}` template, which `resolveValue` would return as raw data rows.
  const resolvedChildren = computed(() => resolveDynamicChildren(props.node.properties.children));
</script>

<template>
  <v-form>
    <ComponentNode
      v-for="(child, index) in resolvedChildren"
      :key="child.id || index"
      :id="child.id"
      :path="child.path"
    />
  </v-form>
</template>
