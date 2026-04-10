<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VRating } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';

  type VRatingProps = InstanceType<typeof VRating>['$props'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const max = computed(() => resolveValue<VRatingProps['length']>(props.node.properties.max) || 5);
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue<number>(props.node.properties.value) || 0;
    },
    set(val: number) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
      dispatchNodeAction(props.node, { value: val });
    },
  });
</script>

<template>
  <v-rating
    v-model="modelValue"
    :length="max"
  ></v-rating>
</template>
