<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Writes through web_core's binder, so { path } (v0.9) and { "@path" } (v1.0) both work.
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const min = computed(() => resolveValue<number>(props.node.properties.min) ?? 0);
  const max = computed(() => resolveValue<number>(props.node.properties.max) ?? 100);

  const modelValue = computed({
    get() {
      return resolveValue<number[]>(props.node.properties.value) ?? [min.value, max.value];
    },
    set(val: number[]) {
      boundValue.value = val;
    },
  });

  const handleEnd = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<template>
  <v-range-slider
    v-model="modelValue"
    :label="label"
    :min="min"
    :max="max"
    @end="handleEnd"
  ></v-range-slider>
</template>
