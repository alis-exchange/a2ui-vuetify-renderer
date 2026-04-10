<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VTextarea } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import { createVuetifyRules } from '../utils/validation';

  type VTextareaProps = InstanceType<typeof VTextarea>['$props'];
  type VTextareaVariant = VTextareaProps['variant'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue<string>(props.node.properties.value) ?? '';
    },
    set(val: string) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
    },
  });

  const vuetifyVariant = computed<VTextareaVariant>(() => {
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
  <v-textarea
    v-model="modelValue"
    :label="label"
    :variant="vuetifyVariant"
    :rules="rules"
    @blur="handleBlur"
  ></v-textarea>
</template>
