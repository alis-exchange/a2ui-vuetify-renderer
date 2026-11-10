<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { useChoiceInput } from '../composables/useChoiceInput';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  // Label, options, two-way value with its change action, and checks: shared with Select and Combobox.
  const { label, options, multiple, modelValue, rules } = useChoiceInput(() => props.node);
</script>

<template>
  <v-autocomplete
    v-model="modelValue"
    :items="options"
    :label="label"
    :multiple="multiple"
    :rules="rules"
  ></v-autocomplete>
</template>
