<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import type { ComponentModel } from '@a2ui/web_core/v0_9';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const url = computed(() => {
    return resolveValue<string>(props.node.properties.url) ?? '';
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

<template>
  <v-img
    :src="url"
    :cover="fit"
    :style="style"
  ></v-img>
</template>
