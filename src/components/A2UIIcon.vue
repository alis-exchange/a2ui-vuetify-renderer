<script setup lang="ts">
  import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const iconName = computed(() => {
    const name = resolveValue(props.node.properties.name) ?? '';
    // Map A2UI icon names to mdi if they don't have a prefix
    if (name && !name.startsWith('mdi-')) {
      return `mdi-${name}`;
    }
    return name;
  });
</script>

<script lang="ts">
  import type { ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const IconApi: ComponentApi = {
    name: 'Icon',
    schema: z
      .object({
        ...CommonProps,
        name: z.union([z.string(), z.object({ path: z.string() })]),
      })
      .strict(),
  };
</script>

<template>
  <v-icon :icon="iconName"></v-icon>
</template>
