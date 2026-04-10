<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import type { ComponentModel } from '@a2ui/web_core/v0_9';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const options = computed(() => resolveValue<readonly any[]>(props.node.properties.options) || []);
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue<any>(props.node.properties.value);
    },
    set(val: any) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
      dispatchNodeAction(props.node, { value: val });
    },
  });

  const multiple = computed(() => resolveValue<string | undefined>(props.node.properties.variant) === 'multipleSelection');
</script>

<template>
  <v-combobox
    v-model="modelValue"
    :items="options"
    :label="label"
    :multiple="multiple"
  ></v-combobox>
</template>
