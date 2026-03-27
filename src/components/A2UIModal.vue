<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useDynamicProps } from '../composables/useDynamicProps';

const props = defineProps<{
  node: any;
}>();

const dynamicProps = useDynamicProps(() => props.node);

const isOpen = ref(false);

watchEffect(() => {
  if (dynamicProps.value.open !== undefined) {
    isOpen.value = !!dynamicProps.value.open;
  }
});
</script>

<template>
  <v-dialog v-model="isOpen" width="auto">
    <template v-slot:activator="{ props: dialogProps }">
      <div v-bind="dialogProps" style="display: inline-block;">
        <A2uiComponentNode v-if="dynamicProps.trigger" :id="dynamicProps.trigger" />
      </div>
    </template>

    <v-card>
      <A2uiComponentNode v-if="dynamicProps.content" :id="dynamicProps.content" />
    </v-card>
  </v-dialog>
</template>
