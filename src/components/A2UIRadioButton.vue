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
