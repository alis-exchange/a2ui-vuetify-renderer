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
  const options = computed(() => resolveValue<readonly any[]>(props.node.properties.options) || []);

  const modelValue = computed({
    get() {
      return resolveValue<any>(props.node.properties.value);
    },
    set(val: any) {
      boundValue.value = val;
      dispatchNodeAction(props.node, { value: val });
    },
  });

  const multiple = computed(() => resolveValue<string | undefined>(props.node.properties.variant) === 'multipleSelection');

  const { rules } = useChecks(() => props.node);
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
