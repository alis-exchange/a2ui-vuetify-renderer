<script setup lang="ts">
import { useDynamicProps } from '../composables/useDynamicProps';

const props = defineProps<{
  node: any;
}>();

const dynamicProps = useDynamicProps(() => props.node);
</script>

<template>
  <video 
    class="a2ui-video w-100" 
    :src="dynamicProps.url" 
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
