<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { ComponentModel } from '@a2ui/web_core/v0_9/state/component-model';

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue } = useA2UI();

const text = computed(() => {
  const t = props.node.properties.text;
  return resolveValue(t) ?? '';
});

const variantClass = computed(() => {
  const v = props.node.properties.variant;
  if (!v) return 'text-body-1';
  
  // Mapping A2UI variants to Vuetify typography classes
  switch (v) {
    case 'h1': return 'text-h1';
    case 'h2': return 'text-h2';
    case 'h3': return 'text-h3';
    case 'h4': return 'text-h4';
    case 'h5': return 'text-h5';
    case 'caption': return 'text-caption';
    case 'body':
    default:
      return 'text-body-1';
  }
});
</script>

<template>
  <div :class="variantClass">{{ text }}</div>
</template>
