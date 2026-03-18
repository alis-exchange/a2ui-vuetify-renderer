<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { ComponentModel } from '@a2ui/web_core/v0_9/state/component-model';

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue, setData } = useA2UI();

const max = computed(() => resolveValue(props.node.properties.max) || 5);
const valuePath = computed(() => props.node.properties.value?.path);

const modelValue = computed({
  get() {
    return resolveValue(props.node.properties.value) || 0;
  },
  set(val: number) {
    if (valuePath.value) {
      setData(valuePath.value, val);
    }
  }
});
</script>

<template>
  <v-rating
    v-model="modelValue"
    :length="max"
  ></v-rating>
</template>
