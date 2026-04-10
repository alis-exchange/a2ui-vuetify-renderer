<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VDatePicker } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';

  type VDatePickerProps = InstanceType<typeof VDatePicker>['$props'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const valuePath = computed(() => props.node.properties.value?.path);
  const min = computed(() => resolveValue<VDatePickerProps['min']>(props.node.properties.min));
  const max = computed(() => resolveValue<VDatePickerProps['max']>(props.node.properties.max));
  const color = computed(() => resolveValue<VDatePickerProps['color']>(props.node.properties.color));
  const multiple = computed(() => resolveValue<VDatePickerProps['multiple']>(props.node.properties.multiple) ?? false);
  const readonly = computed(() => resolveValue<boolean>(props.node.properties.readonly) ?? false);
  const disabled = computed(() => resolveValue<boolean>(props.node.properties.disabled) ?? false);
  const landscape = computed(() => resolveValue<boolean>(props.node.properties.landscape) ?? false);
  const showAdjacentMonths = computed(() => resolveValue<VDatePickerProps['showAdjacentMonths']>(props.node.properties.showAdjacentMonths) ?? false);

  const modelValue = computed({
    get() {
      return resolveValue<any>(props.node.properties.value);
    },
    set(val: any) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
    },
  });

  const handleChange = (val: any) => {
    modelValue.value = val;
    dispatchNodeAction(props.node, { value: val });
  };
</script>

<template>
  <v-date-picker
    :model-value="modelValue"
    :title="label"
    :min="min"
    :max="max"
    :color="color"
    :multiple="multiple"
    :readonly="readonly"
    :disabled="disabled"
    :landscape="landscape"
    :show-adjacent-months="showAdjacentMonths"
    @update:model-value="handleChange"
  ></v-date-picker>
</template>
