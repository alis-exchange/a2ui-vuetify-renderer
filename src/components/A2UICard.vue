<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;
import ComponentNode from '../core/ComponentNode.vue';

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue } = useA2UI();

const childId = computed(() => {
  const c = resolveValue(props.node.properties.child);
  if (typeof c === 'string') return c;
  if (c && typeof c === 'object' && c.id) return c.id;
  return undefined;
});
</script>

<template>
  <v-card>
    <ComponentNode v-if="childId" :id="childId" />
  </v-card>
</template>
