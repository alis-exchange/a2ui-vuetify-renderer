<script setup lang="ts">
  import type { ComponentModel } from '../types';
  import { computed, ref, watch } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();

  const title = computed(() => resolveValue(props.node.properties.title));
  const child = computed(() => {
    const c = resolveValue(props.node.properties.child);
    if (typeof c === 'string') return c;
    if (c && typeof c === 'object' && c.id) return c.id;
    return undefined;
  });

  const expanded = ref<number[]>([]);

  watch(expanded, (val) => {
    dispatchNodeAction(props.node, { expanded: val.length > 0 });
  });
</script>

<script lang="ts">
  import { ActionSchema, ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const ExpansionPanelApi: ComponentApi = {
    name: 'ExpansionPanel',
    schema: z
      .object({
        ...CommonProps,
        title: DynamicStringSchema,
        child: ComponentIdSchema,
        action: ActionSchema.optional(),
      })
      .strict(),
  };
</script>

<template>
  <v-expansion-panels v-model="expanded">
    <v-expansion-panel :title="title">
      <v-expansion-panel-text>
        <ComponentNode
          v-if="child"
          :id="child"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
