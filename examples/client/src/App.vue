<template>
  <v-app>
    <v-app-bar color="primary">
      <v-toolbar-title>A2UI Vue Renderer Playground</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="8">
            <A2uiProvider
              :surface-id="surfaceId"
              :processor="processor"
              @action="handleAction"
            >
              <A2uiComponentNode id="root" />
            </A2uiProvider>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-1">Simulated Transport Metadata</v-card-title>
              <v-card-text>
                <div class="text-caption text-grey mb-2">Sent to Agent on connection:</div>
                <v-sheet color="grey-lighten-4" class="pa-2 rounded text-caption font-weight-mono">
                  <pre>{{ JSON.stringify(clientMetadata, null, 2) }}</pre>
                </v-sheet>
              </v-card-text>
            </v-card>

            <v-card variant="outlined">
              <v-card-title>Action Logs</v-card-title>
              <v-card-text>
                <v-list v-if="actionLogs.length > 0" density="compact">
                  <v-list-item
                    v-for="(log, idx) in actionLogs"
                    :key="idx"
                    class="mb-2 bg-grey-lighten-4 rounded"
                  >
                    <pre class="text-caption">{{
                      JSON.stringify(log, null, 2)
                    }}</pre>
                  </v-list-item>
                </v-list>
                <div v-else class="text-body-2 text-grey">
                  No actions received yet. Click buttons or change inputs to see
                  actions here.
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue";
import { MessageProcessor, Catalog } from "@a2ui/web_core/v0_9";
import { CATALOG_ID, defaultRegistry } from "@alis-build/a2ui-vuetify-renderer";

const surfaceId = "main-surface";

// 1. Simulate Client Capabilities Reporting
const clientMetadata = {
  a2uiClientCapabilities: {
    supportedCatalogIds: [CATALOG_ID]
  }
};

// 2. Demonstrate Lazy Loading of Custom Components
// By utilizing Vue's defineAsyncComponent, we can defer loading heavy custom components
const AsyncGraphComponent = defineAsyncComponent(() => 
  Promise.resolve({
    template: '<div style="border: 2px dashed green; padding: 10px;">I am a Lazy Loaded Graph Component! <slot/></div>'
  })
);

// Register it to the catalog context
defaultRegistry.register(CATALOG_ID, "CustomGraph", AsyncGraphComponent);

const mockCatalog = new Catalog(CATALOG_ID, []);

const actionLogs = ref<any[]>([]);

const handleAction = (action: any) => {
  console.log("Action received via simulated transport:", action);
  actionLogs.value.unshift(action);
};

// Simulated transport message dispatcher
const processor = ref(new MessageProcessor([mockCatalog], handleAction));

onMounted(() => {
  // Simulate receiving initial layout payload from the agent
  processor.value.processMessages([
    {
      createSurface: {
        surfaceId,
        catalogId: CATALOG_ID,
        theme: {
          primaryColor: "#4CAF50",
          errorColor: "#FF5252",
          agentDisplayName: "A2UI Assistant",
        },
      },
    },
    {
      updateDataModel: {
        surfaceId,
        path: "/",
        value: {
          userName: "John Doe",
          newsletter: true,
          volume: 75,
        },
      },
    },
    {
      updateComponents: {
        surfaceId,
        components: [
          {
            id: "root",
            component: "Column",
            children: ["title", "main-card", "settings-card", "custom-card"],
          },
          {
            id: "title",
            component: "Text",
            text: "A2UI Vuetify Renderer Showcase",
            variant: "h3",
          },
          {
            id: "main-card",
            component: "Card",
            child: "card-col",
          },
          {
            id: "card-col",
            component: "Column",
            children: ["card-title", "input-row", "submit-btn"],
          },
          {
            id: "card-title",
            component: "Text",
            text: "User Information",
            variant: "h5",
          },
          {
            id: "input-row",
            component: "Row",
            children: ["name-input", "newsletter-check"],
          },
          {
            id: "name-input",
            component: "TextField",
            label: "Full Name",
            value: { path: "/userName" },
          },
          {
            id: "newsletter-check",
            component: "Checkbox",
            label: "Subscribe to newsletter",
            value: { path: "/newsletter" },
          },
          {
            id: "submit-btn",
            component: "Button",
            variant: "primary",
            child: "submit-text",
            action: {
              event: {
                name: "submitForm",
                context: { user: { path: "/userName" } },
              },
            },
          },
          {
            id: "submit-text",
            component: "Text",
            text: "Save Details",
          },
          {
            id: "settings-card",
            component: "Card",
            child: "settings-col",
          },
          {
            id: "settings-col",
            component: "Column",
            children: ["settings-title", "volume-slider"],
          },
          {
            id: "settings-title",
            component: "Text",
            text: "Settings",
            variant: "h5",
          },
          {
            id: "volume-slider",
            component: "Slider",
            value: { path: "/volume" },
            min: 0,
            max: 100,
            action: {
              event: {
                name: "volumeChanged",
                context: { vol: { path: "/volume" } },
              },
            },
          },
          {
            id: "custom-card",
            component: "Card",
            child: "custom-graph"
          },
          {
            id: "custom-graph",
            component: "CustomGraph"
          }
        ],
      },
    },
  ]);
});
</script>
<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
