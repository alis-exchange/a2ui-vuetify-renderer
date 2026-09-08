<!--
  A2UIProvider — root context provider for an A2UI surface.

  Wraps a subtree of A2UI components, providing them with access to the message
  processor, surface ID, and action handler via Vue's provide/inject system.

  Responsibilities:
  - Provides the `A2UI_CONTEXT_KEY` injection consumed by `useA2UI()`.
  - Owns one web_core `NodeResolver` for the surface (created when the surface
    appears, disposed when it is deleted or the provider unmounts). Descendant
    `ComponentNode`s render from its live tree, so server messages and local
    data-model writes both re-render without remounting.
  - Forwards surface errors (unknown component types, cyclic references,
    expression failures) to `onError`, or `console.error` when no handler is set.
  - Dynamically registers a scoped Vuetify theme when the surface defines
    theme overrides (`primaryColor`, `errorColor`, `backgroundColor`, `surfaceColor`),
    without mutating the global theme. Cleans up the theme on unmount.

  @example
  ```vue
  <template>
    <A2UIProvider
      :processor="processor"
      :surface-id="surfaceId"
      :on-action="handleAction"
      :on-error="handleError"
    >
      <ComponentNode id="root" />
    </A2UIProvider>
  </template>
  ```
-->
<script setup lang="ts">
  import { NodeResolver, type Subscription } from '@a2ui/web_core/v0_9';
  import { computed, onUnmounted, provide, shallowRef, toRaw, watch, watchEffect } from 'vue';
  import { useTheme } from 'vuetify';
  import { VThemeProvider } from 'vuetify/components';
  import { A2UI_CONTEXT_KEY } from './useA2UI';

  const props = withDefaults(
    defineProps<{
      /** The A2UI message processor that owns the surface model and data model. */
      processor: any; // A2uiMessageProcessor
      /** The ID of the A2UI surface to render. */
      surfaceId: string;
      /** Optional callback invoked when a component dispatches an action (fallback path). */
      onAction?: (action: any) => void;
      /** Receives errors the surface reports (unknown types, cyclic references, expression failures). */
      onError?: (error: unknown) => void;
      /**
       * Render from web_core's live node tree (default). Set to `false` for the static
       * legacy path, which only reflects the surface as it was when the subtree mounted.
       */
      nodeResolver?: boolean;
    }>(),
    { nodeResolver: true },
  );

  // web_core objects must not be handed around as Vue reactive proxies (signals and identity
  // checks inside web_core would see the proxy), so everything below uses the raw instance.
  const processor = computed(() => toRaw(props.processor));
  watch(
    () => props.processor,
    (value) => {
      if (value && value !== toRaw(value)) {
        console.warn(
          '[A2UI] The processor passed to A2UIProvider is a Vue reactive proxy (wrapped in ref() or reactive()). ' +
            "Calls made through the proxy bypass web_core's signals and the UI stops updating. Use a plain instance, markRaw(), or shallowRef().",
        );
      }
    },
    { immediate: true },
  );

  // Bumped on surface creation/deletion so the slot remounts against the new surface object.
  const surfaceKey = shallowRef(0);
  const resolver = shallowRef<NodeResolver | undefined>(undefined);
  let errorSubscription: Subscription | undefined;
  let createdSubscription: Subscription | undefined;
  let deletedSubscription: Subscription | undefined;

  const detachSurface = () => {
    errorSubscription?.unsubscribe();
    errorSubscription = undefined;
    resolver.value?.dispose();
    resolver.value = undefined;
    surfaceKey.value++;
  };

  const attachSurface = (surface: any) => {
    detachSurface();
    if (!surface) return;
    errorSubscription = surface.onError?.subscribe((error: unknown) => {
      if (props.onError) props.onError(error);
      else console.error('[A2UI] surface error:', error);
    });
    if (props.nodeResolver && surface.catalog) {
      resolver.value = new NodeResolver(surface, surface.catalog);
    }
  };

  const unsubscribeModel = () => {
    createdSubscription?.unsubscribe();
    deletedSubscription?.unsubscribe();
    createdSubscription = deletedSubscription = undefined;
  };

  // The surface may not exist yet when the provider mounts, and can be deleted and recreated
  // later; SurfaceGroupModel's events are the only signal web_core gives for that.
  const subscribeModel = () => {
    unsubscribeModel();
    const model = processor.value?.model;
    createdSubscription = model?.onSurfaceCreated?.subscribe((surface: any) => {
      if (surface?.id === props.surfaceId) attachSurface(surface);
    });
    deletedSubscription = model?.onSurfaceDeleted?.subscribe((id: string) => {
      if (id === props.surfaceId) detachSurface();
    });
    attachSurface(model?.getSurface?.(props.surfaceId));
  };

  subscribeModel();
  watch(() => [props.processor, props.surfaceId, props.nodeResolver], subscribeModel);

  const themeName = computed(() => `a2ui-theme-${props.surfaceId}`);
  const activeThemeName = shallowRef<string | undefined>(undefined);
  const vuetifyTheme = useTheme();

  const cleanupTheme = () => {
    if (activeThemeName.value && vuetifyTheme.themes.value[activeThemeName.value]) {
      // Delete the dynamically created theme
      delete vuetifyTheme.themes.value[activeThemeName.value];
      activeThemeName.value = undefined;
    }
  };

  onUnmounted(() => {
    unsubscribeModel();
    detachSurface();
    cleanupTheme();
  });

  watchEffect(() => {
    // Re-evaluate whenever the surface is created or deleted
    surfaceKey.value;

    if (processor.value && processor.value.model) {
      const surface = processor.value.model.getSurface(props.surfaceId);
      if (surface && surface.theme) {
        const { primaryColor, errorColor, backgroundColor, surfaceColor } = surface.theme;

        if (primaryColor || errorColor || backgroundColor || surfaceColor) {
          // Base our custom theme on the current global theme
          const currentGlobalThemeName = vuetifyTheme.global.name.value;
          const baseTheme = vuetifyTheme.themes.value[currentGlobalThemeName];

          vuetifyTheme.themes.value[themeName.value] = {
            ...baseTheme,
            dark: baseTheme?.dark ?? false,
            colors: {
              ...(baseTheme?.colors || {}),
              ...(primaryColor ? { primary: primaryColor } : {}),
              ...(errorColor ? { error: errorColor } : {}),
              ...(backgroundColor ? { background: backgroundColor } : {}),
              ...(surfaceColor ? { surface: surfaceColor } : {}),
            },
          } as any;

          activeThemeName.value = themeName.value;
        } else {
          cleanupTheme();
        }
      } else {
        cleanupTheme();
      }
    } else {
      cleanupTheme();
    }
  });

  // Provide the context to all children
  provide(A2UI_CONTEXT_KEY, {
    get surfaceId() {
      return props.surfaceId;
    },
    get processor() {
      return processor.value;
    },
    get resolver() {
      return resolver.value;
    },
    onAction: (action: any) => {
      if (props.onAction) {
        props.onAction(action);
      }
    },
  });
</script>

<template>
  <div
    :key="surfaceKey"
    class="a2ui-provider"
  >
    <v-theme-provider
      v-if="activeThemeName"
      :theme="activeThemeName"
    >
      <slot></slot>
    </v-theme-provider>
    <slot v-else></slot>
  </div>
</template>
