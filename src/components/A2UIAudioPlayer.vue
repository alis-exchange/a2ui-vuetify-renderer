<script setup lang="ts">
  import { useDynamicProps } from '../composables/useDynamicProps';

  const props = defineProps<{
    node: any;
  }>();

  const dynamicProps = useDynamicProps(() => props.node);
</script>

<script lang="ts">
  import { DynamicBooleanSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const AudioPlayerApi: ComponentApi = {
    name: 'AudioPlayer',
    schema: z
      .object({
        ...CommonProps,
        url: DynamicStringSchema,
        autoplay: DynamicBooleanSchema.optional(),
        controls: DynamicBooleanSchema.optional(),
        loop: DynamicBooleanSchema.optional(),
        muted: DynamicBooleanSchema.optional(),
      })
      .strict(),
  };
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
