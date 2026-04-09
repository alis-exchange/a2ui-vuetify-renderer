<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue(props.node.properties.label));
  const valuePath = computed(() => props.node.properties.value?.path);

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

  const handleBlur = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<script lang="ts">
  import { ActionSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const TimePickerApi: ComponentApi = {
    name: 'TimePicker',
    schema: z
      .object({
        ...CommonProps,
        label: DynamicStringSchema.optional(),
        value: DynamicStringSchema,
        action: ActionSchema.optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-text-field
    v-model="modelValue"
    type="time"
    :label="label"
    @blur="handleBlur"
  ></v-text-field>
</template>
