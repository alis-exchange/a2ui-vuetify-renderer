<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VRating } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';

  type VRatingProps = InstanceType<typeof VRating>['$props'];

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Writes through web_core's binder, so { path } (v0.9) and { "@path" } (v1.0) both work.
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const max = computed(() => resolveValue<VRatingProps['length']>(props.node.properties.max) || 5);

  const modelValue = computed({
    get() {
      return resolveValue<number>(props.node.properties.value) || 0;
    },
    set(val: number) {
      boundValue.value = val;
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
