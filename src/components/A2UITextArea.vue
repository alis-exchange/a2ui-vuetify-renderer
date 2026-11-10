<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VTextarea } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';
  import { useChecks } from '../composables/useChecks';

  type VTextareaProps = InstanceType<typeof VTextarea>['$props'];
  type VTextareaVariant = VTextareaProps['variant'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Writes through web_core's binder, so { path } (v0.9) and { "@path" } (v1.0) both work.
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));

  const modelValue = computed({
    get() {
      return resolveValue<string>(props.node.properties.value) ?? '';
    },
    set(val: string) {
      boundValue.value = val;
    },
  });

  const vuetifyVariant = computed<VTextareaVariant>(() => {
    const variant = resolveValue<string | undefined>(props.node.properties.variant);
    switch (variant) {
      case 'filled':
        return 'filled';
      case 'outlined':
        return 'outlined';
      default:
        return 'underlined';
    }
  });

  const { rules } = useChecks(() => props.node);

  const handleBlur = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<template>
  <v-textarea
    v-model="modelValue"
    :label="label"
    :variant="vuetifyVariant"
    :rules="rules"
    @blur="handleBlur"
  ></v-textarea>
</template>
