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

  const { resolveValue, dispatchNodeAction } = useA2UI();

  const labelText = computed(() => {
    const label = resolveValue<string | undefined>(props.node.properties.label);
    if (label !== undefined && label !== null && String(label) !== '') {
      return String(label);
    }
    const text = resolveValue<string | undefined>(props.node.properties.text);
    if (text !== undefined && text !== null && String(text) !== '') {
      return String(text);
    }
    return '';
  });

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
    v-bind="buttonProps"
    :prepend-icon="iconName && labelText ? iconName : undefined"
    @click="handleClick"
  >
    <span v-if="iconName && labelText">{{ labelText }}</span>
    <v-icon
      v-else-if="iconName && !labelText"
      :icon="iconName"
    />
    <template v-else-if="labelText">{{ labelText }}</template>
  </v-btn>
</template>
