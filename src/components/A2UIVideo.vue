<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useDynamicProps } from '../composables/useDynamicProps';
  import { safeMediaUrl } from '../utils/mediaUrl';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const dynamicProps = useDynamicProps(() => props.node.properties);
  // Unsafe schemes and protocol-relative URLs render nothing (A2UI media URL rule).
  const src = computed(() => safeMediaUrl(dynamicProps.value.url));
</script>

<template>
  <video
    v-if="src"
    class="a2ui-video w-100"
    :src="src"
    :controls="dynamicProps.controls !== false"
    :autoplay="dynamicProps.autoplay"
    :loop="dynamicProps.loop"
    :muted="dynamicProps.muted"
  >
    Your browser does not support the video tag.
  </video>
</template>

<style scoped>
  .a2ui-video {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
</style>
