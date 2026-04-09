<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const children = computed(() => resolveValue(props.node.properties.children) || []);

  const resolvedChildren = computed(() => {
    return children.value.map((child: any) => {
      if (typeof child === 'string') return { id: child };
      if (child && typeof child === 'object' && child.id) return { id: child.id };
      // Handling dynamic template lists if necessary would go here
      return child;
    });
  });
</script>

<script lang="ts">
  import { ChildListSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const FormApi: ComponentApi = {
    name: 'Form',
    schema: z
      .object({
        ...CommonProps,
        children: ChildListSchema,
      })
      .strict(),
  };
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
