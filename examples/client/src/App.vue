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
                  class="d-flex align-center mb-3"
                  style="gap: 8px"
                >
                  <span class="text-body-2">Send the form as</span>
                  <v-btn-toggle
                    v-model="protocol"
                    mandatory
                    density="compact"
                    variant="outlined"
                    color="primary"
                    :disabled="formSurfaceActive"
                  >
                    <v-btn value="v0.9">v0.9</v-btn>
                    <v-btn value="v0.9.1">v0.9.1</v-btn>
                    <v-btn value="v1.0">v1.0</v-btn>
                  </v-btn-toggle>
                </div>
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
                  <v-btn
                    color="warning"
                    @click="sendInvalidMessage"
                  >
                    4. Send Invalid Message
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
                  :on-error="handleError"
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
              :on-error="handleError"
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

            <v-card
              variant="outlined"
              class="mt-4"
            >
              <v-card-title>Rejected Messages &amp; Surface Errors</v-card-title>
              <v-card-text>
                <v-list
                  v-if="errorLogs.length > 0"
                  density="compact"
                >
                  <v-list-item
                    v-for="(log, idx) in errorLogs"
                    :key="idx"
                    class="mb-2 bg-red-lighten-5 rounded"
                  >
                    <v-chip
                      size="x-small"
                      color="error"
                      class="mb-1"
                    >
                      {{ log.code }}
                    </v-chip>
                    <div class="text-caption">{{ log.message }}</div>
                    <template v-if="log.details">
                      <pre class="text-caption">{{ JSON.stringify(log.details, null, 2) }}</pre>
                    </template>
                  </v-list-item>
                </v-list>
                <div
                  v-else
                  class="text-body-2 text-grey"
                >
                  No errors. web_core rejects updateComponents messages whose components fail the catalog schema; they show up here.
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
  import type { ComponentApi } from '@a2ui/web_core/v0_9';
  import { Catalog, MessageProcessor, type A2uiMessage } from '@a2ui/web_core/v0_9';
  import { A2UI_V09, A2UI_V10, CATALOG_ID, CATALOG_ID_V1, VUETIFY_COMPONENTS, VUETIFY_COMPONENTS_V1, VUETIFY_THEME_SCHEMA, createVuetifyFunctions, defaultRegistry, type ProtocolKit } from '@alis-build/a2ui-vuetify-renderer';
  import { defineAsyncComponent, defineComponent, h, markRaw, onMounted, ref } from 'vue';
  import { z } from 'zod';
  import CustomChartWidget from './components/CustomChartWidget.vue';

  const surfaceId = 'main-surface';
  const formSurfaceActive = ref(false);

  // 1. Demonstrate Lazy Loading of Custom Components
  const AsyncGraphComponent = defineAsyncComponent(() =>
    Promise.resolve(
      defineComponent({
        render() {
          return h('div', { style: 'border: 2px dashed green; padding: 10px;' }, ['I am a Lazy Loaded Graph Component!']);
        },
      }),
    ),
  );

  // Custom component schemas are written once as builders over a protocol kit, so they can be
  // registered for v0.9 and v1.0. The Vue component itself is registered once.
  const buildCustomGraphApi = (kit: ProtocolKit): ComponentApi => ({
    name: 'CustomGraph',
    schema: z.object({ ...kit.commonProps }).strict(),
  });

  defaultRegistry.register(CATALOG_ID, 'CustomGraph', AsyncGraphComponent, buildCustomGraphApi(A2UI_V09));
  defaultRegistry.registerApi(CATALOG_ID_V1, 'CustomGraph', buildCustomGraphApi(A2UI_V10));

  // 2. Register our static custom component with a schema
  const buildCustomChartApi = (kit: ProtocolKit): ComponentApi => ({
    name: 'CustomChart',
    schema: z
      .object({
        ...kit.commonProps,
        title: z.string().describe('The title of the chart').optional(),
        data: z.array(z.number()).describe('The data points to render'),
      })
      .strict(),
  });

  defaultRegistry.register(CATALOG_ID, 'CustomChart', CustomChartWidget, buildCustomChartApi(A2UI_V09));
  defaultRegistry.registerApi(CATALOG_ID_V1, 'CustomChart', buildCustomChartApi(A2UI_V10));

  // One catalog per protocol family, each with the custom components added so validation accepts them.
  // Locale-aware formatNumber / formatCurrency / pluralize, plus the Vuetify openUrl (http, https, mailto, tel).
  const locale = navigator.language;
  const catalogV09 = new Catalog(CATALOG_ID, '0.9', [...VUETIFY_COMPONENTS, buildCustomGraphApi(A2UI_V09), buildCustomChartApi(A2UI_V09)], createVuetifyFunctions({ locale }), VUETIFY_THEME_SCHEMA);
  const catalogV10 = new Catalog(CATALOG_ID_V1, '1.0', [...VUETIFY_COMPONENTS_V1, buildCustomGraphApi(A2UI_V10), buildCustomChartApi(A2UI_V10)], createVuetifyFunctions({ locale, protocol: A2UI_V10 }));
  const actionLogs = ref<any[]>([]);

  const handleAction = (action: any) => {
    console.log('Action received via simulated transport:', action);
    actionLogs.value.unshift(action);
  };

  // Simulated transport message dispatcher. markRaw: web_core objects must never become Vue
  // reactive proxies, or its Preact signals stop notifying and the UI silently goes stale.
  // One processor serves both: each surface is routed by the version its messages declare.
  const processor = markRaw(new MessageProcessor([catalogV09, catalogV10], handleAction, { version: 'v0.9' }));

  // 3. Capabilities to send to the agent on connection. getRendererCapabilities() would list both
  // catalogs under every version, so advertise each catalog under its own version instead.
  const clientMetadata = {
    'v0.9': { supportedCatalogIds: [CATALOG_ID] },
    'v1.0': { supportedCatalogIds: [CATALOG_ID_V1] },
  };

  // Which protocol the form surface is sent in. The same component list is written once, in v0.9
  // shape, and rewritten for v1.0 on the way out, as an agent migrating to v1.0 would.
  type Protocol = 'v0.9' | 'v0.9.1' | 'v1.0';
  const protocol = ref<Protocol>('v0.9');
  const wireVersion = (p: Protocol) => (p === 'v1.0' ? '1.0' : p);
  const catalogFor = (p: Protocol) => (p === 'v1.0' ? CATALOG_ID_V1 : CATALOG_ID);

  /** v0.9 `path` / `call` keys become v1.0 `@path` / `@call`; ChildList templates keep `path`. */
  const toV1 = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(toV1);
    if (value === null || typeof value !== 'object') return value;
    const rec = value as Record<string, unknown>;
    if ('componentId' in rec) return rec;
    return Object.fromEntries(Object.entries(rec).map(([k, v]) => [k === 'path' ? '@path' : k === 'call' ? '@call' : k, toV1(v)]));
  };
  const inProtocol = <T,>(components: T, p: Protocol) => (p === 'v1.0' ? (toV1(components) as T) : components);
  const formEnvelope = (body: Record<string, unknown>) => ({ version: wireVersion(protocol.value), ...body }) as A2uiMessage;

  // web_core validates every updateComponents component against the catalog schema and throws
  // A2uiValidationError for the whole message. A real transport should catch it like this.
  const errorLogs = ref<{ time: string; code: string; message: string; details?: unknown }[]>([]);

  const safeProcess = (messages: A2uiMessage[]): boolean => {
    try {
      processor.processMessages(messages);
      return true;
    } catch (err) {
      const e = err as { code?: string; message?: string; details?: unknown };
      console.error('Message rejected by web_core:', err);
      errorLogs.value.unshift({ time: new Date().toISOString(), code: e.code ?? 'UNKNOWN_ERROR', message: e.message ?? String(err), details: e.details });
      return false;
    }
  };

  // Surface-level errors (unknown component types, cyclic references, expression failures).
  const handleError = (error: unknown) => {
    const e = error as { code?: string; message?: string };
    errorLogs.value.unshift({ time: new Date().toISOString(), code: e.code ?? 'SURFACE_ERROR', message: e.message ?? String(error) });
  };

  // Shows the validation path: `foo` is not in the strict Button schema, so the message is rejected.
  const sendInvalidMessage = () => {
    safeProcess([
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId,
          components: [{ id: 'bad-btn', component: 'Button', label: 'Oops', action: { event: { name: 'noop' } }, foo: 'bar' }],
        },
      },
    ]);
  };

  // Lifecycle Demo Methods
  const createFormSurface = () => {
    const created = safeProcess([
      formEnvelope({
        createSurface: {
          surfaceId: 'form-surface',
          catalogId: catalogFor(protocol.value),
        },
      }),
      formEnvelope({
        updateDataModel: {
          surfaceId: 'form-surface',
          path: '/',
          value: {
            userName: 'John Doe',
            userEmail: '',
            isSubscribed: false,
          },
        },
      }),
      formEnvelope({
        updateComponents: {
          surfaceId: 'form-surface',
          components: inProtocol(
            [
              {
                id: 'root',
                component: 'Form',
                children: ['formCol'],
              },
              {
                id: 'formCol',
                component: 'Column',
                children: ['title', 'nameInput', 'emailInput', 'subscribeCheckbox'],
              },
              {
                id: 'title',
                component: 'Text',
                text: 'Dynamic Subscription Form',
                variant: 'h5',
              },
              {
                id: 'nameInput',
                component: 'TextField',
                label: 'Name',
                value: { path: '/userName' },
              },
              {
                id: 'emailInput',
                component: 'TextField',
                label: 'Email',
                value: { path: '/userEmail' },
              },
              {
                id: 'subscribeCheckbox',
                component: 'Checkbox',
                label: 'Subscribe',
                value: { path: '/isSubscribed' },
              },
            ],
            protocol.value,
          ),
        },
      }),
    ]);
    formSurfaceActive.value = created;
  };

  const updateFormModel = () => {
    safeProcess([
      formEnvelope({
        updateDataModel: {
          surfaceId: 'form-surface',
          path: '/',
          value: {
            userName: 'Jane Doe',
            userEmail: 'jane.doe@example.com',
            isSubscribed: true,
          },
        },
      }),
    ]);
  };

  const deleteFormSurface = () => {
    safeProcess([
      formEnvelope({
        deleteSurface: {
          surfaceId: 'form-surface',
        },
      }),
    ]);
    formSurfaceActive.value = false;
  };

  onMounted(() => {
    // Simulate receiving initial layout payload from the agent
    safeProcess([
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
              label: 'Save Details',
              action: {
                event: {
                  name: 'submitForm',
                  context: { user: { path: '/userName' } },
                },
              },
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
