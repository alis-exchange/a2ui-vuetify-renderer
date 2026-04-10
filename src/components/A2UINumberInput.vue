<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VTextField } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import { createVuetifyRules } from '../utils/validation';

  type VTextFieldProps = InstanceType<typeof VTextField>['$props'];
  type VTextFieldVariant = VTextFieldProps['variant'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue<string | number>(props.node.properties.value) ?? 0;
    },
    set(val: string | number) {
      if (valuePath.value) {
        const numVal = typeof val === 'string' ? Number(val) : val;
        setData(valuePath.value, isNaN(numVal) ? 0 : numVal);
      }
    },
  });

  const vuetifyVariant = computed<VTextFieldVariant>(() => {
    const variant = resolveValue<string | undefined>(props.node.properties.variant);
    switch (variant) {
      case 'filled':
        return 'filled';
      case 'outlined':
        return 'outlined';
      default:
        return 'underlined';
    }
  });

  const rules = computed(() => {
    const checks = resolveValue<any[]>(props.node.properties.checks) ?? [];
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
