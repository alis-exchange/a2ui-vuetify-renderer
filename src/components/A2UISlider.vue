<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useChecks } from '../composables/useChecks';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const min = computed(() => resolveValue<number>(props.node.properties.min) ?? 0);
  const max = computed(() => resolveValue<number>(props.node.properties.max) ?? 100);
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue<number>(props.node.properties.value) ?? min.value;
    },
    set(val: number) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
    },
  });

  // Rules cover the legacy path; in node mode the binder's messages are shown as well.
  const { rules, validationErrors } = useChecks(() => props.node);

  const handleEnd = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<template>
  <v-slider
    v-model="modelValue"
    :label="label"
    :min="min"
    :max="max"
    :rules="rules"
    :error-messages="validationErrors"
    @end="handleEnd"
  ></v-slider>
</template>
