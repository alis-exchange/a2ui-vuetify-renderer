<template>
  <v-card
    variant="outlined"
    class="pa-4 border-info"
  >
    <div class="text-h6 mb-2">{{ title }}</div>

    <div
      v-if="chartData.length === 0"
      class="text-caption text-grey"
    >
      No data available
    </div>

    <div
      v-else
      class="d-flex align-end"
      style="height: 100px; gap: 8px"
    >
      <v-tooltip
        v-for="(point, idx) in chartData"
        :key="idx"
        location="top"
      >
        <template v-slot:activator="{ props: tooltipProps }">
          <div
            v-bind="tooltipProps"
            class="bg-info rounded-t cursor-pointer"
            :style="{ height: `${point}%`, flex: 1, minWidth: '20px', transition: 'height 0.3s, opacity 0.2s' }"
            @click="handleBarClick(idx, point)"
            @mouseover="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
            :class="{ 'opacity-80': hoveredIndex !== null && hoveredIndex !== idx }"
          ></div>
        </template>
        <span>Value: {{ point }}%</span>
      </v-tooltip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { useA2UI, type ComponentModel } from '@alis-build/a2ui-vuetify-renderer';
  import { computed, ref } from 'vue';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const hoveredIndex = ref<number | null>(null);

  // useA2UI handles resolving dynamic bindings
  const { resolveValue, sendAction } = useA2UI();

  // Resolve properties from A2UI JSON payload
  const title = computed(() => resolveValue(props.node?.properties?.title) || 'Default Chart');

  const chartData = computed(() => {
    const data = resolveValue(props.node?.properties?.data);
    return Array.isArray(data) ? data : [];
  });

  // Action handler to emit events back to the processor
  const handleBarClick = (index: number, value: number) => {
    sendAction('chartPointClicked', props.node.id, {
      index,
      value,
    });
  };
</script>

<style scoped>
  .cursor-pointer {
    cursor: pointer;
  }
  .opacity-80 {
    opacity: 0.8;
  }
</style>
