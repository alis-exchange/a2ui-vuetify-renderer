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
const options = computed(() => resolveValue(props.node.properties.options) || []);
const valuePath = computed(() => props.node.properties.value?.path);

const modelValue = computed({
  get() {
    return resolveValue(props.node.properties.value);
  },
  set(val: any) {
    if (valuePath.value) {
      setData(valuePath.value, val);
    }
  }
});

// A2UI uses 'variant' for selection types sometimes, but select is standard.
const multiple = computed(() => resolveValue(props.node.properties.variant) === 'multipleSelection');

const rules = computed(() => {
  const checks = resolveValue(props.node.properties.checks);
  return createVuetifyRules(checks);
});
</script>

<template>
  <v-select
    v-model="modelValue"
    :items="options"
    :label="label"
    :multiple="multiple"
    :rules="rules"
  ></v-select>
</template>
