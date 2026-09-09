<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useChecks } from '../composables/useChecks';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));
  const min = computed(() => resolveValue<number>(props.node.properties.min) ?? 0);
  const max = computed(() => resolveValue<number>(props.node.properties.max) ?? 100);
  const valuePath = computed(() => props.node.properties.value?.path);

  const modelValue = computed({
    get() {
      return resolveValue<number>(props.node.properties.value) ?? min.value;
    },
    set(val: number) {
      if (valuePath.value) {
        setData(valuePath.value, val);
      }
    },
  });

  const { rules, validationErrors } = useChecks(() => props.node);

  // One source of truth at a time. While the binder reports failures it is authoritative and
  // Vuetify gets no rules: it caches rule results until the input's own model changes, which
  // would leave a stale message on screen after a cross-field check clears, and can contradict a
  // sibling Button gating on the same `isValid`. When it reports nothing the rules take over —
  // the legacy path, and the checks the binder evaluates as passing (it reads
  // `rule.condition || rule`, so a literal `condition: false` never reaches it).
  const activeRules = computed(() => (validationErrors.value?.length ? [] : rules.value));

  const handleEnd = () => {
    dispatchNodeAction(props.node, { value: modelValue.value });
  };
</script>

<template>
  <v-slider
    v-model="modelValue"
    :label="label"
    :min="min"
    :max="max"
    :rules="activeRules"
    :error-messages="validationErrors"
    @end="handleEnd"
  ></v-slider>
</template>
