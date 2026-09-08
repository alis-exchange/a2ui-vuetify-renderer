<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue<any>(props.node.properties.value);
    },
    set(val: any) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
      const fileNames = Array.isArray(val) ? val.map((f: File) => f?.name ?? String(f)) : val?.name ? [val.name] : [];
      dispatchNodeAction(props.node, { files: fileNames });
    },
  });
</script>

<template>
  <v-file-input
    v-model="modelValue"
    :label="label"
  ></v-file-input>
</template>
