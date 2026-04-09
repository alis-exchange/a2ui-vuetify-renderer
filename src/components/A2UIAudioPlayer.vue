<script setup lang="ts">
  import { useDynamicProps } from '../composables/useDynamicProps';

  const props = defineProps<{
    node: any;
  }>();

  const dynamicProps = useDynamicProps(() => props.node);
</script>

<template>
  <audio
    class="a2ui-audio w-100"
    :src="dynamicProps.url"
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
