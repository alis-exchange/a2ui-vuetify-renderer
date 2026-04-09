<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
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
    set(val: string) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
      dispatchNodeAction(props.node, { value: val });
    },
  });

  const rules = computed(() => {
    const checks = resolveValue(props.node.properties.checks);
    return createVuetifyRules(checks);
  });
</script>

<script lang="ts">
  import { ActionSchema, CheckableSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const RadioButtonApi: ComponentApi = {
    name: 'RadioButton',
    schema: z
      .object({
        ...CommonProps,
        label: DynamicStringSchema.optional(),
        options: z.array(
          z
            .object({
              label: DynamicStringSchema,
              value: z.string(),
            })
            .strict(),
        ),
        value: DynamicStringSchema,
        action: ActionSchema.optional(),
        checks: CheckableSchema.shape.checks,
      })
      .strict(),
  };
</script>

<template>
  <v-radio-group
    v-model="modelValue"
    :label="label"
    :rules="rules"
  >
    <v-radio
      v-for="opt in options"
      :key="opt"
      :label="opt"
      :value="opt"
    ></v-radio>
  </v-radio-group>
</template>
