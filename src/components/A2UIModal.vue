<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed, ref, watch, watchEffect } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Only the props this component reads.
  const dynamicProps = computed(() => ({
    open: resolveValue<boolean>(props.node.properties.open),
    trigger: resolveValue<string>(props.node.properties.trigger),
    content: resolveValue<string>(props.node.properties.content),
  }));

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
