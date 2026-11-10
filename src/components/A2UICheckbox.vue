<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';
  import { useChecks } from '../composables/useChecks';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Writes through web_core's binder, so { path } (v0.9) and { "@path" } (v1.0) both work.
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));

  const modelValue = computed({
    get() {
      return resolveValue<boolean>(props.node.properties.value) ?? false;
    },
    set(val: boolean) {
      boundValue.value = val;
      dispatchNodeAction(props.node, { value: val });
    },
  });

  const { rules } = useChecks(() => props.node);
</script>

<template>
  <v-checkbox
    v-model="modelValue"
    :label="label"
    :rules="rules"
  ></v-checkbox>
</template>
