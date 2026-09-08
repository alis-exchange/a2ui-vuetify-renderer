<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VBtn } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import { useChecks } from '../composables/useChecks';

  type VBtnProps = InstanceType<typeof VBtn>['$props'];
  type VBtnVariant = VBtnProps['variant'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();

  // A failing check (evaluated by web_core's binder in node mode) disables the button and
  // surfaces the message.
  const { isValid, validationErrors } = useChecks(() => props.node);

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
    :title="validationErrors?.join(', ') || undefined"
    @click="handleClick"
  >
    <v-icon :icon="iconName" />
  </v-btn>
</template>
