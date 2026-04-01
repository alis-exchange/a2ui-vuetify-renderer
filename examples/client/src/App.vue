<template>
  <v-app>
    <v-app-bar color="primary">
      <v-toolbar-title>A2UI Vue Renderer Playground</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <!-- Data Model and Lifecycle Demo Controls -->
            <v-card
              variant="outlined"
              class="mb-6"
            >
              <v-card-title>Data Model & Lifecycle Demo</v-card-title>
              <v-card-text>
                <div
                  class="d-flex gap-2 flex-wrap"
                  style="gap: 8px"
                >
                  <v-btn
                    color="primary"
                    @click="createFormSurface"
                    :disabled="formSurfaceActive"
                  >
                    1. Create Form
                  </v-btn>
                  <v-btn
                    color="info"
                    @click="updateFormModel"
                    :disabled="!formSurfaceActive"
                  >
                    2. Update Data Model
                  </v-btn>
                  <v-btn
                    color="error"
                    @click="deleteFormSurface"
                    :disabled="!formSurfaceActive"
                  >
                    3. Delete Surface
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Dynamic Form Surface -->
            <v-card
              v-if="formSurfaceActive"
              variant="outlined"
              class="mb-6 border-primary"
            >
              <v-card-text>
                <A2uiProvider
                  surface-id="form-surface"
                  :processor="processor"
                  @action="handleAction"
                >
                  <A2uiComponentNode id="root" />
                </A2uiProvider>
              </v-card-text>
            </v-card>

            <v-divider class="my-4"></v-divider>

            <!-- Main Original Surface -->
            <div class="text-h6 mb-2">Original Showcase Surface</div>
            <A2uiProvider
              :surface-id="surfaceId"
              :processor="processor"
              @action="handleAction"
            >
              <A2uiComponentNode id="root" />
            </A2uiProvider>
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-card
              variant="outlined"
              class="mb-4"
            >
              <v-card-title class="text-subtitle-1">Simulated Transport Metadata</v-card-title>
              <v-card-text>
                <div class="text-caption text-grey mb-2">Sent to Agent on connection:</div>
                <v-sheet
                  color="grey-lighten-4"
                  class="pa-2 rounded text-caption font-weight-mono"
                >
                  <pre>{{ JSON.stringify(clientMetadata, null, 2) }}</pre>
                </v-sheet>
              </v-card-text>
            </v-card>

            <v-card variant="outlined">
              <v-card-title>Action Logs</v-card-title>
              <v-card-text>
                <v-list
                  v-if="actionLogs.length > 0"
                  density="compact"
                >
                  <v-list-item
                    v-for="(log, idx) in actionLogs"
                    :key="idx"
                    class="mb-2 bg-grey-lighten-4 rounded"
                  >
                    <pre class="text-caption">{{ JSON.stringify(log, null, 2) }}</pre>
                  </v-list-item>
                </v-list>
                <div
                  v-else
                  class="text-body-2 text-grey"
                >
                  No actions received yet. Click buttons or change inputs to see actions here.
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
  import { Catalog, MessageProcessor } from '@a2ui/web_core/v0_9';
  import type { ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA, defaultRegistry } from '@alis-build/a2ui-vuetify-renderer';
  import { defineAsyncComponent, h, onMounted, ref } from 'vue';
  import CustomChartWidget from './components/CustomChartWidget.vue';

  const surfaceId = 'main-surface';
  const formSurfaceActive = ref(false);

  // 1. Simulate Client Capabilities Reporting
  const clientMetadata = {
    a2uiClientCapabilities: {
      supportedCatalogIds: [CATALOG_ID],
    },
  };

  // 2. Demonstrate Lazy Loading of Custom Components
  const AsyncGraphComponent = defineAsyncComponent(() =>
    Promise.resolve({
      render() {
        return h('div', { style: 'border: 2px dashed green; padding: 10px;' }, ['I am a Lazy Loaded Graph Component!']);
      },
    }),
  );

  const CustomGraphApi: ComponentApi = {
    name: 'CustomGraph',
    schema: z.object({}).strict(),
  };

  defaultRegistry.register(CATALOG_ID, 'CustomGraph', AsyncGraphComponent, CustomGraphApi);

  // 3. Register our static custom component with a schema
  const CustomChartApi: ComponentApi = {
    name: 'CustomChart',
    schema: z.object({
      title: z.string().describe("The title of the chart").optional(),
      data: z.array(z.number()).describe("The data points to render")
    }).strict()
  };

  defaultRegistry.register(CATALOG_ID, 'CustomChart', CustomChartWidget, CustomChartApi);

  // Inject custom components into the mock catalog schema to bypass A2UI validation errors
  const customComponentsSchema = [
    ...VUETIFY_COMPONENTS,
    CustomGraphApi,
    CustomChartApi,
  ];

  const mockCatalog = new Catalog(CATALOG_ID, customComponentsSchema as any, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
  const actionLogs = ref<any[]>([]);

  const handleAction = (action: any) => {
    console.log('Action received via simulated transport:', action);
    actionLogs.value.unshift(action);
  };

  // Simulated transport message dispatcher
  const processor = ref(new MessageProcessor([mockCatalog], handleAction));

  // Lifecycle Demo Methods
  const createFormSurface = () => {
    processor.value.processMessages([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'form-surface',
          catalogId: CATALOG_ID,
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'form-surface',
          path: '/',
          value: {
            userName: 'John Doe',
            userEmail: '',
            isSubscribed: false,
          },
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'form-surface',
          components: [
            {
              id: 'root',
              component: 'Form',
              children: ['form-col'],
            },
            {
              id: 'form-col',
              component: 'Column',
              children: ['title', 'name-input', 'email-input', 'subscribe-checkbox'],
            },
            {
              id: 'title',
              component: 'Text',
              text: 'Dynamic Subscription Form',
              variant: 'h5',
            },
            {
              id: 'name-input',
              component: 'TextField',
              label: 'Name',
              value: { path: '/userName' },
            },
            {
              id: 'email-input',
              component: 'TextField',
              label: 'Email',
              value: { path: '/userEmail' },
            },
            {
              id: 'subscribe-checkbox',
              component: 'Checkbox',
              label: 'Subscribe',
              value: { path: '/isSubscribed' },
            },
          ],
        },
      },
    ]);
    formSurfaceActive.value = true;
  };

  const updateFormModel = () => {
    processor.value.processMessages([
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'form-surface',
          path: '/',
          value: {
            userName: 'Jane Doe',
            userEmail: 'jane.doe@example.com',
            isSubscribed: true,
          },
        },
      },
    ]);
  };

  const deleteFormSurface = () => {
    processor.value.processMessages([
      {
        version: 'v0.9',
        deleteSurface: {
          surfaceId: 'form-surface',
        },
      },
    ]);
    formSurfaceActive.value = false;
  };

  onMounted(() => {
    // Simulate receiving initial layout payload from the agent
    processor.value.processMessages([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId,
          catalogId: CATALOG_ID,
          theme: {
            primaryColor: '#4CAF50',
            errorColor: '#FF5252',
            agentDisplayName: 'A2UI Assistant',
          },
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId,
          path: '/',
          value: {
            userName: 'John Doe',
            newsletter: true,
            volume: 75,
          },
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId,
          components: [
            {
              id: 'root',
              component: 'Column',
              children: ['title', 'main-card', 'settings-card', 'custom-card', 'chart-card'],
            },
            {
              id: 'title',
              component: 'Text',
              text: 'A2UI Vuetify Renderer Showcase',
              variant: 'h3',
            },
            {
              id: 'main-card',
              component: 'Card',
              child: 'card-col',
            },
            {
              id: 'card-col',
              component: 'Column',
              children: ['card-title', 'input-row', 'submit-btn'],
            },
            {
              id: 'card-title',
              component: 'Text',
              text: 'User Information',
              variant: 'h5',
            },
            {
              id: 'input-row',
              component: 'Row',
              children: ['name-input', 'newsletter-check'],
            },
            {
              id: 'name-input',
              component: 'TextField',
              label: 'Full Name',
              value: { path: '/userName' },
            },
            {
              id: 'newsletter-check',
              component: 'Checkbox',
              label: 'Subscribe to newsletter',
              value: { path: '/newsletter' },
            },
            {
              id: 'submit-btn',
              component: 'Button',
              variant: 'primary',
              child: 'submit-text',
              action: {
                event: {
                  name: 'submitForm',
                  context: { user: { path: '/userName' } },
                },
              },
            },
            {
              id: 'submit-text',
              component: 'Text',
              text: 'Save Details',
            },
            {
              id: 'settings-card',
              component: 'Card',
              child: 'settings-col',
            },
            {
              id: 'settings-col',
              component: 'Column',
              children: ['settings-title', 'volume-slider'],
            },
            {
              id: 'settings-title',
              component: 'Text',
              text: 'Settings',
              variant: 'h5',
            },
            {
              id: 'volume-slider',
              component: 'Slider',
              value: { path: '/volume' },
              min: 0,
              max: 100,
              action: {
                event: {
                  name: 'volumeChanged',
                  context: { vol: { path: '/volume' } },
                },
              },
            },
            {
              id: 'custom-card',
              component: 'Card',
              child: 'custom-graph',
            },
            {
              id: 'custom-graph',
              component: 'CustomGraph',
            },
            {
              id: 'chart-card',
              component: 'Card',
              child: 'my-custom-chart',
            },
            {
              id: 'my-custom-chart',
              component: 'CustomChart',
              title: 'Monthly Sales',
              data: [20, 50, 80, 40, 90, 60, 100],
            },
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
