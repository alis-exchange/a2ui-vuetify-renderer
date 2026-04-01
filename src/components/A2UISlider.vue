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

<template>
  <v-slider
    v-model="modelValue"
    :label="label"
    :min="min"
    :max="max"
    @end="handleEnd"
  ></v-slider>
</template>
