<script setup lang="ts">
  import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const url = computed(() => {
    return resolveValue(props.node.properties.url) ?? '';
  });

  const fit = computed(() => {
    // A2UI fit corresponds to CSS object-fit or Vuetify cover prop
    const f = props.node.properties.fit;
    if (f === 'cover') return true;
    return false;
  });

  // Vuetify v-img has a "cover" boolean prop for fit="cover"
  // and "aspect-ratio" which we might need to handle, but for now we just map standard.
  // variant could be 'icon', 'avatar', 'smallFeature' etc. which might imply sizes.
  const style = computed(() => {
    const v = props.node.properties.variant;
    if (v === 'avatar') {
      return { width: '40px', height: '40px', borderRadius: '50%' };
    }
    if (v === 'icon') {
      return { width: '24px', height: '24px' };
    }
    if (v === 'smallFeature') {
      return { width: '100px', height: '100px' };
    }
    return {};
  });
</script>

<script lang="ts">
  import { DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const ImageApi: ComponentApi = {
    name: 'Image',
    schema: z
      .object({
        ...CommonProps,
        url: DynamicStringSchema,
        description: DynamicStringSchema.optional(),
        fit: z.enum(['contain', 'cover', 'fill', 'none', 'scaleDown']).default('fill').optional(),
        variant: z.enum(['icon', 'avatar', 'smallFeature', 'mediumFeature', 'largeFeature', 'header']).default('mediumFeature').optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-img
    :src="url"
    :cover="fit"
    :style="style"
  ></v-img>
</template>
