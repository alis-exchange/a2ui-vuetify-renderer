<script setup lang="ts">
  import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { createVuetifyRules } from '../utils/validation';
  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

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
  <v-textarea
    v-model="modelValue"
    :label="label"
    :variant="vuetifyVariant"
    :rules="rules"
    @blur="handleBlur"
  ></v-textarea>
</template>
