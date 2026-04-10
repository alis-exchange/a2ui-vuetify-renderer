<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VAlert } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  type VAlertProps = InstanceType<typeof VAlert>['$props'];
  type VAlertType = VAlertProps['type'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const title = computed(() => resolveValue<string | undefined>(props.node.properties.title));
  const text = computed(() => resolveValue<string | undefined>(props.node.properties.text));
  const type = computed(() => resolveValue<VAlertType>(props.node.properties.variant) || 'info');
  const child = computed(() => resolveValue<string | undefined>(props.node.properties.child));
</script>

<template>
  <v-alert
    :title="title"
    :text="text"
    :type="type"
  >
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-alert>
</template>
