import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import vuetify from "vite-plugin-vuetify";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    dts({
      insertTypesEntry: true,
      exclude: ["src/main.ts", "src/App.vue"], // Exclude dev files from types
    }),
  ],
  build: {
    lib: {
      // The entry point to your library
      entry: resolve(__dirname, "src/index.ts"),
      name: "A2UiVueRenderer",
      fileName: (format) => `a2ui-vue-renderer.${format}.js`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library
      external: ["vue", "vuetify", "vuetify/components", "vuetify/directives", "@a2ui/web_core"],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          vue: "Vue",
          vuetify: "Vuetify",
          "@a2ui/web_core": "A2UIWebCore"
        },
      },
    },
  },
});
