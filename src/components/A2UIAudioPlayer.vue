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
  <audio
    v-if="src"
    class="a2ui-audio w-100"
    :src="src"
    :controls="dynamicProps.controls !== false"
    :autoplay="dynamicProps.autoplay"
    :loop="dynamicProps.loop"
    :muted="dynamicProps.muted"
  >
    Your browser does not support the audio element.
  </audio>
</template>

<style scoped>
  .a2ui-audio {
    max-width: 100%;
  }
</style>
