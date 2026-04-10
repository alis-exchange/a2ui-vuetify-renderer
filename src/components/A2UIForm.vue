<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import type { ComponentModel } from '@a2ui/web_core/v0_9';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const children = computed(() => resolveValue<any[]>(props.node.properties.children) || []);

  const resolvedChildren = computed(() => {
    return children.value.map((child: any) => {
      if (typeof child === 'string') return { id: child };
      if (child && typeof child === 'object' && child.id) return { id: child.id };
      // Handling dynamic template lists if necessary would go here
      return child;
    });
  });
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
