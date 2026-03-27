<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue, setData } = useA2UI();

const label = computed(() => resolveValue(props.node.properties.label));
const valuePath = computed(() => props.node.properties.value?.path);

const modelValue = computed({
  get() {
    return resolveValue(props.node.properties.value);
  },
  set(val: any) {
    if (valuePath.value) {
      setData(valuePath.value, val);
    }
  }
});
</script>

<template>
  <v-date-picker
    v-model="modelValue"
    :title="label"
  ></v-date-picker>
</template>
