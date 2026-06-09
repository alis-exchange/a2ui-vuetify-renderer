<!--
  ComponentNode — renders a single A2UI component by its ID.

  Looks up the component model from the surface by `id`, resolves the matching
  Vue component from the `ComponentRegistry` based on the node's type, and
  renders it dynamically via `<component :is>`.

  When a `path` prop is provided (used by dynamic list children), the node
  provides a new `A2UI_CONTEXT_KEY` with an updated `dataContextPath` so
  descendants resolve data bindings relative to that list item's scope.

  If no matching component is registered, renders a red error fallback.
  If the node ID doesn't exist in the surface, renders an orange debug box.

  @example
  ```vue
  <ComponentNode id="header-text" />
  <ComponentNode id="list-item-template" :path="`/items/${index}`" />
  ```
-->
<script setup lang="ts">
  import { computed, inject, provide } from 'vue';
  import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
  import { A2UI_REGISTRY_KEY, ComponentRegistry, defaultRegistry } from './ComponentRegistry';
  import { CATALOG_ID } from './constants';

  const props = defineProps<{
    /** The component ID as defined in the surface's component model. */
    id: string;
    /** Optional data context path override for dynamic template children (e.g. `/items/0`). */
    path?: string;
  }>();

  const context = inject(A2UI_CONTEXT_KEY);
  const registry = inject<ComponentRegistry>(A2UI_REGISTRY_KEY, defaultRegistry);

  // If this node is rendered with a dynamic list path, provide a new context downwards
  if (context && props.path !== undefined) {
    provide(A2UI_CONTEXT_KEY, {
      ...context,
      dataContextPath: props.path,
    });
  }

  const surface = computed(() => {
    if (!context) return undefined;
    return context.processor.model?.getSurface(context.surfaceId);
  });

  const node = computed(() => {
    return surface.value?.componentsModel?.get(props.id);
  });

  const catalogId = computed(() => {
    return surface.value?.catalogId || CATALOG_ID;
  });

  const componentType = computed(() => {
    return node.value?.type;
  });

  const layoutClasses = computed(() => {
    if (!node.value) return {};
    const weight = node.value.properties.weight;

    const classes: Record<string, boolean> = {};
    if (typeof weight === 'number') {
      classes[`flex-grow-${weight}`] = true;
    }
    return classes;
  });

  const resolvedComponent = computed(() => {
    if (!componentType.value) return undefined;
    return registry.get(catalogId.value, componentType.value);
  });
</script>

<template>
  <template v-if="node">
    <component
      v-if="resolvedComponent"
      :is="resolvedComponent"
      :node="node"
      :class="layoutClasses"
    />
    <div
      v-else
      class="a2ui-error-fallback"
      style="color: red; border: 1px solid red; padding: 4px"
      :class="layoutClasses"
    >
      Unknown component type: {{ componentType }}
    </div>
  </template>
  <div
    v-else
    style="border: 2px solid orange; color: orange; padding: 10px"
  >
    Missing node: {{ id }}
    <pre style="font-size: 10px">Surface exists: {{ !!context?.processor?.model?.getSurface(context.surfaceId) }}</pre>
    <pre style="font-size: 10px">Component keys: {{ Array.from(context?.processor?.model?.getSurface(context.surfaceId)?.componentsModel?.['components']?.keys() || []) }}</pre>
  </div>
</template>
