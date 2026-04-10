<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { ref, watch, watchEffect } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useDynamicProps } from '../composables/useDynamicProps';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const dynamicProps = useDynamicProps(() => props.node);
  const { dispatchNodeAction } = useA2UI();

  const isOpen = ref(false);

  watchEffect(() => {
    if (dynamicProps.value.open !== undefined) {
      isOpen.value = !!dynamicProps.value.open;
    }
  });

  watch(isOpen, (open) => {
    dispatchNodeAction(props.node, { open });
  });
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="auto"
  >
    <template v-slot:activator="{ props: dialogProps }">
      <div
        v-bind="dialogProps"
        style="display: inline-block"
      >
        <A2uiComponentNode
          v-if="dynamicProps.trigger"
          :id="dynamicProps.trigger"
        />
      </div>
    </template>

    <v-card>
      <A2uiComponentNode
        v-if="dynamicProps.content"
        :id="dynamicProps.content"
      />
    </v-card>
  </v-dialog>
</template>
