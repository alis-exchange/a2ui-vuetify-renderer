<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { ComponentModel } from '@a2ui/web_core/v0_9/state/component-model';
import ComponentNode from '../core/ComponentNode.vue';

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue, sendAction } = useA2UI();

const childId = computed(() => {
  const c = resolveValue(props.node.properties.child);
  if (typeof c === 'string') return c;
  if (c && typeof c === 'object' && c.id) return c.id;
  return undefined;
});

const buttonProps = computed(() => {
  const variant = resolveValue(props.node.properties.variant);
  // Default Vuetify props
  let color = undefined;
  let variantProp: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain' = 'elevated';

  switch (variant) {
    case 'primary':
      color = 'primary';
      variantProp = 'elevated';
      break;
    case 'borderless':
      variantProp = 'text';
      break;
    case 'default':
    default:
      variantProp = 'tonal';
      break;
  }

  // TODO: Add support for 'checks' (disabled state based on validation)
  return {
    color,
    variant: variantProp,
  };
});

const handleClick = () => {
  const action = resolveValue(props.node.properties.action);
  if (!action) return;

  if (action.event) {
    sendAction(action.event.name, resolveValue(action.event.context));
  } else if (action.functionCall) {
    // TODO: implement local function execution if required by catalog
    console.warn('functionCall action not yet supported in Button');
  }
};
</script>

<template>
  <v-btn
    v-bind="buttonProps"
    @click="handleClick"
  >
    <ComponentNode v-if="childId" :id="childId" />
  </v-btn>
</template>
