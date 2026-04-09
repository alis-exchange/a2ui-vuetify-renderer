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
      dispatchNodeAction(props.node, { value: val });
    },
  });

  const multiple = computed(() => resolveValue(props.node.properties.variant) === 'multipleSelection');

  const rules = computed(() => {
    const checks = resolveValue(props.node.properties.checks);
    return createVuetifyRules(checks);
  });
</script>

<script lang="ts">
  import { ActionSchema, CheckableSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const SelectApi: ComponentApi = {
    name: 'Select',
    schema: z
      .object({
        ...CommonProps,
        label: DynamicStringSchema.optional(),
        options: z.array(z.any()),
        value: z.union([z.string(), z.array(z.any())]),
        variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
  };
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
