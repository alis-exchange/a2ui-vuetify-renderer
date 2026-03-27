<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;
import { createVuetifyRules } from '../utils/validation';

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue, setData } = useA2UI();

const label = computed(() => resolveValue(props.node.properties.label));
const valuePath = computed(() => props.node.properties.value?.path);

const modelValue = computed({
  get() {
    return resolveValue(props.node.properties.value) ?? false;
  },
  set(val: boolean) {
    if (valuePath.value) {
      setData(valuePath.value, val);
    }
  }
});

const rules = computed(() => {
  const checks = resolveValue(props.node.properties.checks);
  return createVuetifyRules(checks);
});
</script>

<template>
  <v-checkbox
    v-model="modelValue"
    :label="label"
    :rules="rules"
  ></v-checkbox>
</template>
