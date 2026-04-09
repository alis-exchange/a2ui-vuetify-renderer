<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue(props.node.properties.label));
  const min = computed(() => resolveValue(props.node.properties.min) ?? 0);
  const max = computed(() => resolveValue(props.node.properties.max) ?? 100);
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue(props.node.properties.value) ?? min.value;
    },
    set(val: number) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
    },
  });

  const handleEnd = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<script lang="ts">
  import { ActionSchema, CheckableSchema, DynamicNumberSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const SliderApi: ComponentApi = {
    name: 'Slider',
    schema: z
      .object({
        ...CommonProps,
        label: DynamicStringSchema.optional(),
        min: z.number().default(0).optional(),
        max: z.number(),
        value: DynamicNumberSchema,
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
  };
</script>

<template>
  <v-slider
    v-model="modelValue"
    :label="label"
    :min="min"
    :max="max"
    @end="handleEnd"
  ></v-slider>
</template>
