<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import ComponentNode from '../core/ComponentNode.vue';
  import type { ComponentModel } from '@a2ui/web_core/v0_9';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();

  const title = computed(() => resolveValue<string | undefined>(props.node.properties.title));
  const child = computed(() => resolveValue<string | undefined>(props.node.properties.child));

  const expanded = ref<number[]>([]);

  watch(expanded, (val) => {
    dispatchNodeAction(props.node, { expanded: val.length > 0 });
  });
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
