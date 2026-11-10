<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VTextField } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';

  type VTextFieldProps = InstanceType<typeof VTextField>['$props'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Writes through web_core's binder, so { path } (v0.9) and { "@path" } (v1.0) both work.
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const label = computed(() => resolveValue<VTextFieldProps['label']>(props.node.properties.label));

  const modelValue = computed({
    get() {
      return resolveValue<string | undefined>(props.node.properties.value);
    },
    set(val: any) {
      boundValue.value = val;
    },
  });

  const handleBlur = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<template>
  <v-text-field
    v-model="modelValue"
    type="time"
    :label="label"
    @blur="handleBlur"
  ></v-text-field>
</template>
