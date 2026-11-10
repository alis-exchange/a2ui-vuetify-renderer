<!--
  ChoicePicker's `displayStyle: 'segmented'`: a row of connected buttons (Vuetify v-btn-toggle).
  Internal to ChoicePicker, not a catalog component of its own.
-->
<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useBinding } from '../composables/useBinding';
  import { useChecks } from '../composables/useChecks';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  const boundValue = useBinding<unknown>(() => props.node, 'value');

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const multiple = computed(() => resolveValue<string | undefined>(props.node.properties.variant) === 'multipleSelection');

  // Options may be plain strings or { label, value } (or Vuetify-style { title, value }) objects.
  const options = computed(() =>
    (resolveValue<unknown[]>(props.node.properties.options) ?? []).map((option) => {
      if (option !== null && typeof option === 'object') {
        const rec = option as Record<string, unknown>;
        const value = rec.value ?? rec.label ?? rec.title;
        return { value, title: String(rec.label ?? rec.title ?? value) };
      }
      return { value: option, title: String(option) };
    }),
  );

  const modelValue = computed({
    get() {
      const value = resolveValue<unknown>(props.node.properties.value);
      if (multiple.value) return Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value];
      return value;
    },
    set(val: unknown) {
      boundValue.value = val;
      dispatchNodeAction(props.node, { value: val });
    },
  });

  const { errorMessages } = useChecks(() => props.node);
  const errors = computed(() => errorMessages(modelValue.value));
</script>

<template>
  <div class="a2ui-segmented-choice">
    <div
      v-if="label"
      class="text-body-2 mb-1"
    >
      {{ label }}
    </div>
    <v-btn-toggle
      v-model="modelValue"
      :multiple="multiple"
      color="primary"
      variant="outlined"
      divided
      density="comfortable"
    >
      <v-btn
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
      >
        {{ option.title }}
      </v-btn>
    </v-btn-toggle>
    <div
      v-for="message in errors"
      :key="message"
      class="text-error text-caption mt-1"
    >
      {{ message }}
    </div>
  </div>
</template>
