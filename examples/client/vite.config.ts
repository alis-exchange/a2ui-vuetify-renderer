import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vuetify from 'vite-plugin-vuetify';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    // The renderer is consumed as a file: package; make sure it shares this app's single copy of
    // web_core (two copies means two Preact signal instances and a silently non-reactive UI).
    dedupe: ['@a2ui/web_core', 'vue', 'vuetify'],
  },
  optimizeDeps: {
    // Optimize the renderer and web_core together in one pass. Discovering them lazily produces
    // chunks from different optimizer runs, which the browser loads as separate module instances.
    include: ['@alis-build/a2ui-vuetify-renderer', '@a2ui/web_core/v0_9', '@a2ui/web_core/v0_9/basic_catalog'],
  },
});
