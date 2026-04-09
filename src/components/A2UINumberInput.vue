<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import type { ComponentModel } from '../types';
  import { createVuetifyRules } from '../utils/validation';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue(props.node.properties.label));
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue(props.node.properties.value) ?? 0;
    },
    set(val: string | number) {
      if (valuePath.value) {
        const numVal = typeof val === 'string' ? Number(val) : val;
        setData(valuePath.value, isNaN(numVal) ? 0 : numVal);
      }
    },
  });

  const variant = computed(() => resolveValue(props.node.properties.variant));

  const vuetifyVariant = computed(() => {
    switch (variant.value) {
      case 'filled':
        return 'filled';
      case 'outlined':
        return 'outlined';
      default:
        return 'underlined';
    }
  });

  const rules = computed(() => {
    const checks = resolveValue(props.node.properties.checks);
    return createVuetifyRules(checks);
  });

  const handleBlur = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<template>
  <v-text-field
    v-model="modelValue"
    type="number"
    :label="label"
    :variant="vuetifyVariant"
    :rules="rules"
    @blur="handleBlur"
  ></v-text-field>
</template>
