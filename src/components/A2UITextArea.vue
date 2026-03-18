<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { ComponentModel } from '@a2ui/web_core/v0_9/state/component-model';
import { createVuetifyRules } from '../utils/validation';

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue, setData } = useA2UI();

const label = computed(() => resolveValue(props.node.properties.label));
const valuePath = computed(() => props.node.properties.value?.path);

const modelValue = computed({
  get() {
    return resolveValue(props.node.properties.value) ?? '';
  },
  set(val: string) {
    if (valuePath.value) {
      setData(valuePath.value, val);
    }
  }
});

const variant = computed(() => resolveValue(props.node.properties.variant));

const vuetifyVariant = computed(() => {
  switch (variant.value) {
    case 'filled': return 'filled';
    case 'outlined': return 'outlined';
    default: return 'underlined';
  }
});

const rules = computed(() => {
  const checks = resolveValue(props.node.properties.checks);
  return createVuetifyRules(checks);
});
</script>

<template>
  <v-textarea
    v-model="modelValue"
    :label="label"
    :variant="vuetifyVariant"
    :rules="rules"
  ></v-textarea>
</template>
