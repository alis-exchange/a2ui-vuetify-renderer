<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';
  import { useChecks } from '../composables/useChecks';
  import { useInputVariant } from '../composables/useInputVariant';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Writes through web_core's binder, so { path } (v0.9) and { "@path" } (v1.0) both work.
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));

  const modelValue = computed({
    get() {
      return resolveValue<string | number>(props.node.properties.value) ?? 0;
    },
    set(val: string | number) {
      const numVal = typeof val === 'string' ? Number(val) : val;
      boundValue.value = isNaN(numVal) ? 0 : numVal;
    },
  });

  const vuetifyVariant = useInputVariant(() => props.node);

  const { rules } = useChecks(() => props.node);

  const handleBlur = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<template>
  <v-text-field
    v-model="modelValue"
    type="number"
    :label="label"
    :variant="vuetifyVariant"
    :rules="rules"
    @blur="handleBlur"
  ></v-text-field>
</template>
