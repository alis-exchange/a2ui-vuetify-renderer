<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue } = useA2UI();

const events = computed(() => resolveValue(props.node.properties.events) || []);
</script>

<template>
  <!-- Basic fallback for Calendar if v-calendar is not available -->
  <v-sheet class="pa-4 border">
    <div class="text-h6 mb-2">Calendar (Events)</div>
    <v-list v-if="events.length > 0">
      <v-list-item v-for="(event, i) in events" :key="i">
        <v-list-item-title>{{ event.title || event.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ event.date || event.start }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <div v-else class="text-body-2 text-medium-emphasis">No events.</div>
  </v-sheet>
</template>
