<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { VCalendar } from 'vuetify/components';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';

  type VCalendarProps = InstanceType<typeof VCalendar>['$props'];
  type VCalendarViewType = NonNullable<VCalendarProps['type']>;

  const CALENDAR_TYPES: readonly VCalendarViewType[] = ['month', 'category', 'day', '4day', 'custom-daily', 'custom-weekly', 'week'];

  function toCalendarViewType(raw: string | undefined): VCalendarViewType {
    const v = raw ?? 'month';
    return (CALENDAR_TYPES as readonly string[]).includes(v) ? (v as VCalendarViewType) : 'month';
  }

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Writes through web_core's binder, so { path } (v0.9) and { "@path" } (v1.0) both work.
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const calendarType = computed<VCalendarProps['type']>(() => toCalendarViewType(resolveValue<string | undefined>(props.node.properties.type)));
  const events = computed(() => resolveValue<any[]>(props.node.properties.events) || []);
  const weekdays = computed(() => resolveValue<number[]>(props.node.properties.weekdays) ?? [0, 1, 2, 3, 4, 5, 6]);
  const eventColor = computed(() => resolveValue<string | undefined>(props.node.properties.eventColor) ?? resolveValue<string | undefined>(props.node.properties.color) ?? 'primary');

  const modelValue = computed({
    get() {
      return resolveValue<any>(props.node.properties.value) ?? '';
    },
    set(val: any) {
      boundValue.value = val;
    },
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
