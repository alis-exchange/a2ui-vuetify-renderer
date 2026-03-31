<script setup lang="ts">
import { computed, ref } from 'vue';
import { useA2UI } from '../composables/useA2UI';
import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

const props = defineProps<{
  node: ComponentModel;
}>();

const { resolveValue, setData, dispatchNodeAction } = useA2UI();

const calendarType = computed(() => resolveValue(props.node.properties.type) ?? 'month');
const events = computed(() => resolveValue(props.node.properties.events) || []);
const weekdays = computed(() => resolveValue(props.node.properties.weekdays) ?? [0, 1, 2, 3, 4, 5, 6]);
const color = computed(() => resolveValue(props.node.properties.color));
const eventColor = computed(() => resolveValue(props.node.properties.eventColor) ?? 'primary');
const valuePath = computed(() => props.node.properties.value?.path);

const modelValue = computed({
  get() {
    return resolveValue(props.node.properties.value) ?? '';
  },
  set(val: any) {
    if (valuePath.value) {
      setData(valuePath.value, val);
    }
  }
});

const handleClickDate = (_e: Event, day: any) => {
  const date = day?.date;
  if (date) {
    modelValue.value = date;
  }
  dispatchNodeAction(props.node, { date, interaction: 'click:date' });
};

const handleClickEvent = (_e: Event, eventScope: any) => {
  const event = eventScope?.event;
  dispatchNodeAction(props.node, {
    event: event ? { name: event.name, start: event.start, end: event.end } : {},
    interaction: 'click:event',
  });
};
</script>

<template>
  <v-calendar
    :model-value="modelValue"
    :type="calendarType"
    :events="events"
    :weekdays="weekdays"
    :event-color="eventColor"
    @click:date="handleClickDate"
    @click:event="handleClickEvent"
  ></v-calendar>
</template>
