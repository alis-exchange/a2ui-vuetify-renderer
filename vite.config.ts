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
      tsconfigPath: "./tsconfig.app.json",
    }),
  ],
  build: {
    lib: {
      // The entry point to your library
      entry: resolve(__dirname, "src/index.ts"),
      name: "A2UiVueRenderer",
      fileName: "a2ui-vuetify-renderer",
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library. web_core must match as a
      // prefix: a bundled copy of its /v0_9 subpath brings its own Preact signals instance, and
      // effects from one instance never track signals created by another, so rendering would go
      // silently non-reactive against the consumer's MessageProcessor.
      external: [/^vue$/, /^vuetify(\/|$)/, /^@a2ui\/web_core(\/|$)/, /^zod(\/|$)/],
      output: {
        // Provide global variables to the UMD build for externalized deps
        globals: (id) => {
          if (id === "vue") return "Vue";
          if (id.startsWith("vuetify")) return "Vuetify";
          if (id.startsWith("@a2ui/web_core")) return "A2UIWebCore";
          if (id.startsWith("zod")) return "Zod";
          return id;
        },
      },
    },
  },
});
