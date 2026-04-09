<script setup lang="ts">
  import { type SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const text = computed(() => {
    const t = props.node.properties.text;
    return resolveValue(t) ?? '';
  });

  const variantClass = computed(() => {
    const v = props.node.properties.variant;
    if (!v) return 'text-body-1';

    // Mapping A2UI variants to Vuetify typography classes
    switch (v) {
      case 'h1':
        return 'text-h1';
      case 'h2':
        return 'text-h2';
      case 'h3':
        return 'text-h3';
      case 'h4':
        return 'text-h4';
      case 'h5':
        return 'text-h5';
      case 'caption':
        return 'text-caption';
      case 'body':
      default:
        return 'text-body-1';
    }
  });
</script>

<script lang="ts">
  import { DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const TextApi: ComponentApi = {
    name: 'Text',
    schema: z
      .object({
        ...CommonProps,
        text: DynamicStringSchema,
        variant: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'caption', 'body']).default('body').optional(),
      })
      .strict(),
  };
</script>

<template>
  <div :class="variantClass">{{ text }}</div>
</template>
