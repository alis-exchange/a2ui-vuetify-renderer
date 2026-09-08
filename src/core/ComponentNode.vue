<!--
  ComponentNode — renders a single A2UI component by its ID.

  Resolves the matching Vue component from the `ComponentRegistry` based on the
  node's type and renders it dynamically via `<component :is>`.

  In node mode (the default, see `A2UIProvider`), the surface is rendered from
  web_core's `NodeResolver` tree: `id="root"` under the provider picks the
  resolver's root node, and any other `id` is looked up among the live child
  nodes held in the parent's resolved props. The node's `props` signal is
  mirrored into the context as `nodeProps`, which is what makes `resolveValue`
  reactive for descendants, and the node's data scope becomes their
  `dataContextPath`. Components that have not arrived yet render as a small
  placeholder and are swapped in place when they do.

  Without a live node (legacy mode, or ids the resolver does not know) the
  component model is read straight from the surface, and a `path` prop scopes
  descendants for dynamic list children.

  If no matching component is registered, renders a red error fallback.
  If the node ID doesn't exist in the surface, renders an orange debug box.

  @example
  ```vue
  <ComponentNode id="root" />
  <ComponentNode id="list-item-template" :path="`/items/${index}`" />
  ```
-->
<script setup lang="ts">
  import { effect, getValue, type ComponentNode as A2uiNode, type NodeProps } from '@a2ui/web_core/v0_9';
  import { computed, inject, onUnmounted, provide, shallowRef, watch } from 'vue';
  import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
  import { A2UI_REGISTRY_KEY, ComponentRegistry, defaultRegistry } from './ComponentRegistry';
  import { CATALOG_ID } from './constants';
  import { findLiveNode } from './liveNodes';

  const props = defineProps<{
    /** The component ID as defined in the surface's component model. */
    id?: string;
    /** Optional data context path override for dynamic template children (e.g. `/items/0`). */
    path?: string;
    /** A live node from the resolver tree; takes precedence over `id`. */
    node?: A2uiNode;
  }>();

  const context = inject(A2UI_CONTEXT_KEY);
  const registry = inject<ComponentRegistry>(A2UI_REGISTRY_KEY, defaultRegistry);

  // The resolver's root, tracked only for the top-level `id="root"` node.
  const rootNode = shallowRef<A2uiNode | undefined>(undefined);
  let stopRoot: (() => void) | undefined;
  watch(
    () => (props.node === undefined && !context?.nodeProps && props.id === 'root' ? context?.resolver : undefined),
    (resolver) => {
      stopRoot?.();
      stopRoot = undefined;
      if (!resolver) {
        rootNode.value = undefined;
        return;
      }
      stopRoot = effect(() => {
        rootNode.value = getValue(resolver.rootNode);
      });
    },
    { immediate: true },
  );

  const liveNode = computed<A2uiNode | undefined>(() => {
    if (props.node) return props.node;
    if (context?.nodeProps) return props.id ? findLiveNode(context.nodeProps.value, props.id, props.path) : undefined;
    return props.id === 'root' ? rootNode.value : undefined;
  });

  // Mirror of the live node's resolved props. web_core's effect re-runs whenever the props
  // signal emits; writing into a shallowRef lets every computed built on resolveValue re-run.
  const nodeProps = shallowRef<NodeProps | undefined>(undefined);
  let stopProps: (() => void) | undefined;
  watch(
    liveNode,
    (n) => {
      stopProps?.();
      stopProps = undefined;
      if (!n) {
        nodeProps.value = undefined;
        return;
      }
      stopProps = effect(() => {
        nodeProps.value = getValue(n.props);
      });
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stopProps?.();
    stopRoot?.();
  });

  if (context) {
    provide(A2UI_CONTEXT_KEY, {
      get surfaceId() {
        return context.surfaceId;
      },
      get processor() {
        return context.processor;
      },
      onAction: (action) => context.onAction(action),
      get resolver() {
        return context.resolver;
      },
      // A live node carries its own data scope; legacy children fall back to the `path` prop.
      get dataContextPath() {
        return liveNode.value?.dataPath ?? props.path ?? context.dataContextPath;
      },
      nodeProps,
    });
  }

  const surface = computed(() => {
    if (!context) return undefined;
    return context.processor.model?.getSurface(context.surfaceId);
  });

  const node = computed(() => {
    const componentId = liveNode.value?.componentId ?? props.id;
    return componentId ? surface.value?.componentsModel?.get(componentId) : undefined;
  });

  const catalogId = computed(() => {
    return surface.value?.catalogId || CATALOG_ID;
  });

  const componentType = computed(() => {
    return node.value?.type ?? liveNode.value?.type;
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

  // Pending and cyclic stand-ins have nothing to render yet. An unknown-type node still has its
  // definition, so the registry gets a chance (custom components outside the catalog).
  const isPlaceholder = computed(() => {
    const state = liveNode.value?.state;
    return state === 'pending' || state === 'cyclic';
  });
  const waitingForRoot = computed(() => props.node === undefined && props.id === 'root' && !!context?.resolver && !liveNode.value);
</script>

<template>
  <span
    v-if="isPlaceholder"
    class="a2ui-placeholder text-disabled text-caption"
    :title="`web_core node state: ${liveNode?.state}`"
  >
    [{{ liveNode?.state }}: {{ liveNode?.componentId }}]
  </span>
  <template v-else-if="node">
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
  <span
    v-else-if="waitingForRoot"
    hidden
  ></span>
  <div
    v-else
    style="border: 2px solid orange; color: orange; padding: 10px"
  >
    Missing node: {{ id }}
    <pre style="font-size: 10px">Surface exists: {{ !!context?.processor?.model?.getSurface(context.surfaceId) }}</pre>
    <pre style="font-size: 10px">Component keys: {{ Array.from(context?.processor?.model?.getSurface(context.surfaceId)?.componentsModel?.['components']?.keys() || []) }}</pre>
  </div>
</template>
