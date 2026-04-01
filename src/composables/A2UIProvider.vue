<script setup lang="ts">
  import { computed, onMounted, onUnmounted, provide, shallowRef, watchEffect } from 'vue';
  import { useTheme } from 'vuetify';
  import { VThemeProvider } from 'vuetify/components';
  import { A2UI_CONTEXT_KEY } from './useA2UI';

  const props = defineProps<{
    processor: any; // A2uiMessageProcessor
    surfaceId: string;
    onAction?: (action: any) => void;
  }>();

  // We track the surface locally to trigger re-renders if needed,
  // though the provider's primary role is just providing context.
  const updateKey = shallowRef(0);

  const handleUpdate = () => {
    updateKey.value++;
  };

  onMounted(() => {
    if (props.processor && typeof props.processor.addEventListener === 'function') {
      props.processor.addEventListener('update', handleUpdate);
    }
  });

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
    if (props.processor && typeof props.processor.removeEventListener === 'function') {
      props.processor.removeEventListener('update', handleUpdate);
    }
    cleanupTheme();
  });

  watchEffect(() => {
    // Trigger dependency on updateKey and surfaceId
    updateKey.value;

    if (props.processor && props.processor.model) {
      const surface = props.processor.model.getSurface(props.surfaceId);
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
      return props.processor;
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
    :key="updateKey"
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
