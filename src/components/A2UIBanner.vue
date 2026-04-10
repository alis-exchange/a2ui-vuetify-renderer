<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VBanner } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  type VBannerProps = InstanceType<typeof VBanner>['$props'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const text = computed(() => resolveValue<VBannerProps['text']>(props.node.properties.text));
  const icon = computed(() => resolveValue<VBannerProps['icon']>(props.node.properties.icon));

  const child = computed(() => resolveValue<string | undefined>(props.node.properties.child));
</script>

<template>
  <v-banner
    :text="text"
    :icon="icon"
  >
    <ComponentNode
      v-if="child"
      :id="child"
    />
  </v-banner>
</template>
