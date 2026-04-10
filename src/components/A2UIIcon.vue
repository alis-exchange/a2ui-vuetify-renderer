<script setup lang="ts">
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import type { ComponentModel } from '@a2ui/web_core/v0_9';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue } = useA2UI();

  const iconName = computed(() => {
    const name = resolveValue<string>(props.node.properties.name) ?? '';
    // Map A2UI icon names to mdi if they don't have a prefix
    if (name && !name.startsWith('mdi-')) {
      return `mdi-${name}`;
    }
    return name;
  });
</script>

<template>
  <v-icon :icon="iconName"></v-icon>
</template>
