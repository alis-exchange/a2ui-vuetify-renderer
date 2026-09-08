<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VBtn } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';

  type VBtnProps = InstanceType<typeof VBtn>['$props'];
  type VBtnVariant = VBtnProps['variant'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction, nodeProps } = useA2UI();

  // In node mode web_core's binder evaluates `checks` and reports the outcome on the node's
  // resolved props; a failing check disables the button and surfaces the message.
  const isValid = computed(() => nodeProps?.value?.isValid !== false);
  const validationErrors = computed(() => (nodeProps?.value?.validationErrors as string[] | undefined) ?? []);

  const iconName = computed(() => {
    const raw = resolveValue<string | undefined>(props.node.properties.icon);
    if (raw === undefined || raw === null || raw === '') return '';
    const name = String(raw);
    if (name && !name.startsWith('mdi-')) {
      return `mdi-${name}`;
    }
    return name;
  });

  const buttonProps = computed(() => {
    const variant = resolveValue<string | undefined>(props.node.properties.variant);
    let color: string | undefined = undefined;
    let variantProp: VBtnVariant = 'elevated';

    switch (variant) {
      case 'primary':
        color = 'primary';
        variantProp = 'elevated';
        break;
      case 'borderless':
        variantProp = 'text';
        break;
      case 'default':
      default:
        variantProp = 'tonal';
        break;
    }

    return {
      color,
      variant: variantProp,
    };
  });

  const handleClick = () => {
    dispatchNodeAction(props.node);
  };
</script>

<template>
  <v-btn
    icon
    v-bind="buttonProps"
    :disabled="!isValid"
    :title="validationErrors.join(', ') || undefined"
    @click="handleClick"
  >
    <v-icon :icon="iconName" />
  </v-btn>
</template>
