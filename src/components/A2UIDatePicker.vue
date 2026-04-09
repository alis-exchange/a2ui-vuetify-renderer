<script setup lang="ts">
  import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;
  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue(props.node.properties.label));
  const valuePath = computed(() => props.node.properties.value?.path);
  const min = computed(() => resolveValue(props.node.properties.min));
  const max = computed(() => resolveValue(props.node.properties.max));
  const color = computed(() => resolveValue(props.node.properties.color));
  const multiple = computed(() => resolveValue(props.node.properties.multiple) ?? false);
  const readonly = computed(() => resolveValue(props.node.properties.readonly) ?? false);
  const disabled = computed(() => resolveValue(props.node.properties.disabled) ?? false);
  const landscape = computed(() => resolveValue(props.node.properties.landscape) ?? false);
  const showAdjacentMonths = computed(() => resolveValue(props.node.properties.showAdjacentMonths) ?? false);

  const modelValue = computed({
    get() {
      return resolveValue(props.node.properties.value);
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

<script lang="ts">
  import { ActionSchema, CheckableSchema, DynamicBooleanSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const DatePickerApi: ComponentApi = {
    name: 'DatePicker',
    schema: z
      .object({
        ...CommonProps,
        label: DynamicStringSchema.optional(),
        value: DynamicStringSchema,
        min: DynamicStringSchema.optional(),
        max: DynamicStringSchema.optional(),
        color: z.string().optional(),
        multiple: z.union([z.boolean(), z.literal('range')]).optional(),
        readonly: DynamicBooleanSchema.optional(),
        disabled: DynamicBooleanSchema.optional(),
        landscape: DynamicBooleanSchema.optional(),
        showAdjacentMonths: DynamicBooleanSchema.optional(),
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
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
