<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VEmptyState } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  type VEmptyStateProps = InstanceType<typeof VEmptyState>['$props'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const title = computed(() => resolveValue<VEmptyStateProps['title']>(props.node.properties.title));
  const text = computed(() => resolveValue<VEmptyStateProps['text']>(props.node.properties.text));
  const icon = computed(() => resolveValue<VEmptyStateProps['icon']>(props.node.properties.icon));

  const child = computed(() => resolveValue<string | undefined>(props.node.properties.child));
</script>

<template>
  <v-empty-state
    :title="title"
    :text="text"
    :icon="icon"
  >
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-empty-state>
</template>
