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
  // Set when the agent's data, not the user, opened or closed the dialog: that dispatch must not
  // run gesture-only functions (openUrl) on the strength of the user's last click elsewhere.
  let changedByData = false;

  watchEffect(() => {
    const open = dynamicProps.value.open;
    if (open !== undefined && !!open !== isOpen.value) {
      changedByData = true;
      isOpen.value = !!open;
    }
  });

  watch(isOpen, (open) => {
    const userInitiated = !changedByData;
    changedByData = false;
    dispatchNodeAction(props.node, { open }, { userInitiated });
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
