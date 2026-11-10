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

  const modelValue = computed({
    get() {
      return resolveValue<any>(props.node.properties.value);
    },
    set(val: any) {
      boundValue.value = val;
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
