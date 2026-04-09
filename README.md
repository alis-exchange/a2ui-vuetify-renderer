# A2UI Vuetify Renderer

[![npm](https://img.shields.io/npm/v/@alis-build/a2ui-vuetify-renderer)](https://www.npmjs.com/package/@alis-build/a2ui-vuetify-renderer)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

A Vue 3 rendering library for the [A2UI Protocol v0.9](https://a2ui.org/specification/v0.9-a2ui/). It translates A2UI JSON messages into interactive Vue interfaces backed by [Vuetify 4](https://vuetifyjs.com/) components.

The default component catalog extends the ideas of the [v0.9 basic catalog](https://a2ui.org/specification/v0.9-a2ui/) with additional Vuetify-backed types (for example `Tabs`, `Modal`, `Video`, `AudioPlayer`, `ChoicePicker`). Agents must use the same `catalogId` your app advertises—typically `CATALOG_ID` from this package—so `createSurface` and the renderer registry stay aligned.

## How it works

An AI agent produces a stream of JSONL messages (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`). The renderer consumes these messages through [`@a2ui/web_core`](https://github.com/google/A2UI/tree/main/renderers/web_core), which handles protocol parsing, state management, and data binding. This library provides the Vue component layer that turns that state into a live Vuetify UI.

```
Agent → JSONL stream → @a2ui/web_core (MessageProcessor) → Vue reactivity bridge → Vuetify components
```

## Installation

```bash
pnpm add @alis-build/a2ui-vuetify-renderer @a2ui/web_core vuetify vue
```

The library ships ESM (`dist/a2ui-vuetify-renderer.js`), UMD (`dist/a2ui-vuetify-renderer.umd.cjs`), and TypeScript declarations (`dist/index.d.ts`).

### Peer dependencies

| Package          | Version   |
| ---------------- | --------- |
| `vue`            | `^3.5.30` |
| `vuetify`        | `^4.0.2`  |
| `@a2ui/web_core` | `^0.9.0`  |

### Catalog ID

`CATALOG_ID` is the URI of the [Vuetify catalog JSON schema](https://github.com/alis-exchange/a2ui-vuetify-renderer/blob/main/catalog/vuetify-catalog.json) (`https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json`). Pass it to `new Catalog(CATALOG_ID, …)`, `createSurface.catalogId`, and `a2uiClientCapabilities.supportedCatalogIds` so validation and rendering agree.

## Setup

### 1. Configure Vuetify in your host app

The renderer expects Vuetify to be installed as a Vue plugin. You also need `vite-plugin-vuetify` for component auto-imports.

**`vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
})
```

**`main.ts`**

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify()
const app = createApp(App)
app.use(vuetify)
app.mount('#app')
```

### 2. (Optional) Install the renderer plugin

The `A2UiVueRenderer` plugin globally registers `<A2uiProvider>` and `<A2uiComponentNode>` and populates the default component registry. You can also pass custom component overrides.

```typescript
import { A2UiVueRenderer } from '@alis-build/a2ui-vuetify-renderer'

app.use(A2UiVueRenderer, {
  components: {
    GoogleMap: MyCustomMapComponent, // extend the catalog
  },
})
```

If you skip the plugin, import `A2UIProvider`, `ComponentNode`, and `registerDefaultComponents`, then call `registerDefaultComponents()` once during app setup so `defaultRegistry` is populated (the plugin does this inside `install`).

## Quick start

```vue
<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { MessageProcessor, Catalog } from '@a2ui/web_core/v0_9'
  import type { A2uiClientAction } from '@a2ui/web_core/v0_9'
  import {
    A2UIProvider,
    ComponentNode,
    CATALOG_ID,
    VUETIFY_COMPONENTS,
    VUETIFY_FUNCTIONS,
    VUETIFY_THEME_SCHEMA,
    registerDefaultComponents,
  } from '@alis-build/a2ui-vuetify-renderer'

  registerDefaultComponents()

  const handleAction = (action: A2uiClientAction) => {
    console.log('Action from A2UI:', action)
  }

  const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA)
  const processor = new MessageProcessor([catalog], handleAction)
  const surfaceId = 'demo-surface'
  const ready = ref(false)

  onMounted(() => {
    processor.processMessages([
      {
        createSurface: {
          surfaceId,
          catalogId: CATALOG_ID,
          theme: { primaryColor: '#6200EE' },
        },
      },
    ])

    processor.processMessages([
      {
        updateComponents: {
          surfaceId,
          components: [
            { id: 'root', component: 'Column', children: ['heading', 'greet-btn'] },
            { id: 'heading', component: 'Text', text: 'Hello from A2UI!', variant: 'h4' },
            { id: 'greet-btn', component: 'Button', variant: 'primary', child: 'btn-label', action: { event: { name: 'greet' } } },
            { id: 'btn-label', component: 'Text', text: 'Click Me' },
          ],
        },
      },
    ])

    ready.value = true
  })
</script>

<template>
  <v-app>
    <v-main class="pa-4">
      <A2UIProvider
        v-if="ready"
        :processor="processor"
        :surface-id="surfaceId"
        :on-action="handleAction"
      >
        <ComponentNode id="root" />
      </A2UIProvider>
    </v-main>
  </v-app>
</template>
```

## Architecture

### Core modules

| Module                     | Role                                                                                                                                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`A2UIProvider`**         | Wraps a surface. Provides processor, surface ID, and action callback via `provide/inject`. Listens to processor `update` events to trigger re-renders. Bridges A2UI theme colors (`primaryColor`, `errorColor`, etc.) into a dynamic Vuetify theme via `v-theme-provider`.                        |
| **`ComponentNode`**        | Recursive renderer. Resolves a component ID from the surface's `ComponentsModel`, looks up the Vue component in the registry, and renders it with `<component :is="...">`. Supports a `path` prop for scoped data context in dynamic lists. Falls back to an error placeholder for unknown types. |
| **`ComponentRegistry`**    | A `Map<string, Component>` that maps A2UI type strings (e.g. `"Button"`) to Vue components. Exposes `register()`, `registerAll()`, `get()`, and `has()`. The singleton `defaultRegistry` is pre-populated by `registerDefaultComponents()`.                                                       |
| **`useA2UI()`**            | Composable that injects the provider context. Returns `resolveValue`, `resolveDynamicChildren`, `sendAction`, `dispatchNodeAction`, `setData`, `surfaceId`, `dataContext`, and `dataContextPath`. Builds a `DataContext` from `@a2ui/web_core/v0_9` for path-based and function-call value resolution. Uses `SurfaceModel.dispatchAction()` for schema-validated action payloads. |
| **`useDynamicProps()`**    | Composable for custom catalog components: given a node (ref, getter, or plain object), returns a computed ref of properties with each value passed through `resolveValue` for bindings.                                                                                                        |
| **`getCatalogSchema()`**   | Returns a deep-cloned JSON Schema for the Vuetify catalog, merging in stub entries for any extra components registered on a `ComponentRegistry` under the same `catalogId` (useful for agents or tooling). Accepts an optional `{ filter }` predicate to narrow the returned components — see **Filtering the catalog schema** below. |
| **`catalogFilters`**       | Pre-built filter predicates for `getCatalogSchema`: `catalogFilters.customOnly` (non-built-in components only), `catalogFilters.only(...names)` (include-list), `catalogFilters.exclude(...names)` (exclude-list). |

Form components use internal helpers in `src/utils/validation.ts` to map A2UI `checks` to Vuetify validation rules.

### Data flow

1. **Messages in** — `MessageProcessor.processMessages()` parses JSONL and updates `SurfaceModel` state (components, data model, theme).
2. **Reactivity bridge** — `A2UIProvider` subscribes to the processor's `update` event and increments a `shallowRef` key, causing Vue to re-render the subtree.
3. **Tree resolution** — `ComponentNode` reads the flat adjacency list from `SurfaceComponentsModel`, resolves `children`/`child`/`trigger`/`content` references, and recursively renders the tree.
4. **Value binding** — Components call `resolveValue()` which delegates to `DataContext.resolveDynamicValue()` — handling literals, `{ path }` lookups, and `{ call }` function expressions.
5. **Two-way binding** — Input components use writable `computed` properties that call `setData()` on the surface's `DataModel` when the user types.
6. **Actions out** — On user interaction (e.g. button click), components call `sendAction(name, sourceComponentId, context)` which resolves context values from the data model and dispatches a validated `A2uiClientAction` via the surface model (or falls back to the `onAction` callback).

### Dynamic list rendering

When `children` is an object `{ path, componentId }` instead of an array, the renderer iterates the data model array at `path` and renders the template `componentId` for each item, passing a scoped `path` prop (`/items/0`, `/items/1`, ...) so child components resolve relative bindings correctly.

## Custom Components

You can extend the renderer by defining your own Vue components and registering them. This is useful for complex data visualizations, specialized input fields, or integrating third-party libraries.

### 1. Define a Custom Component

Use the `useA2UI` composable to easily map A2UI JSON properties to your component's props and emit actions back to the agent.

```vue
<!-- src/components/CustomChartWidget.vue -->
<template>
  <v-card variant="outlined" class="pa-4 border-info">
    <div class="text-h6 mb-2">{{ title }}</div>
    <div class="d-flex align-end" style="height: 100px; gap: 8px;">
      <div 
        v-for="(point, idx) in chartData" 
        :key="idx"
        class="bg-info rounded-t cursor-pointer"
        :style="{ height: `${point}%`, width: '40px', transition: 'height 0.3s' }"
        @click="handleBarClick(idx, point)"
      ></div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useA2UI, type ComponentModel } from '@alis-build/a2ui-vuetify-renderer';

const props = defineProps<{
  node: ComponentModel;
}>();

// useA2UI automatically handles resolving dynamic data bindings (e.g. { path: '/myData' })
const { resolveValue, sendAction } = useA2UI();

// Resolve the 'title' property from the A2UI JSON node
const title = computed(() => resolveValue(props.node?.properties?.title) || 'Default Chart');

// Resolve the 'data' property from the A2UI JSON node, defaulting to an empty array
const chartData = computed(() => {
  const data = resolveValue(props.node?.properties?.data);
  return Array.isArray(data) ? data : [];
});

// Emit an action back to the agent when a user interacts
const handleBarClick = (index: number, value: number) => {
  sendAction('chartPointClicked', props.node.id, {
    index,
    value
  });
};
</script>
```

### 2. Register the Component

Before rendering a surface, register your new component with the `defaultRegistry` using the same `CATALOG_ID` that your surface uses. 

You can optionally provide a `ComponentApi` definition for your component. This is highly recommended as it allows `getCatalogSchema()` to expose your custom component's properties to the LLM agent, so the agent knows exactly what data your component expects.

```typescript
import { CATALOG_ID, defaultRegistry } from '@alis-build/a2ui-vuetify-renderer';
import { DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import CustomChartWidget from './components/CustomChartWidget.vue';

// Define the ComponentApi using Zod for your custom component
const CustomChartApi: ComponentApi = {
  name: 'CustomChart',
  schema: z.object({
    title: z.string().describe("The title of the chart").optional(),
    data: z.object({ path: z.string() }).describe("Path to the data model array")
  }).strict()
};

// Register the component under the type name "CustomChart" along with its API
defaultRegistry.register(CATALOG_ID, 'CustomChart', CustomChartWidget, CustomChartApi);
```

### 3. Send it from the Agent

Now your agent can send `updateComponents` messages using your new `"CustomChart"` type.

```json
{
  "id": "my-custom-chart",
  "component": "CustomChart",
  "title": "Monthly Sales",
  "data": { "path": "/salesData" }
}
```

### Filtering the catalog schema

`getCatalogSchema()` accepts an optional `filter` predicate to control which components appear in the returned schema. This is useful when you only want to expose a subset of components to the LLM agent.

```typescript
import { getCatalogSchema, catalogFilters, defaultRegistry, CATALOG_ID } from '@alis-build/a2ui-vuetify-renderer';

// Full catalog (default — same as before)
const full = getCatalogSchema(defaultRegistry, CATALOG_ID);

// Only custom (non-built-in) components
const custom = getCatalogSchema(defaultRegistry, CATALOG_ID, {
  filter: catalogFilters.customOnly,
});

// Only specific components
const subset = getCatalogSchema(defaultRegistry, CATALOG_ID, {
  filter: catalogFilters.only('Button', 'TextField', 'Card'),
});

// Everything except a few
const lighter = getCatalogSchema(defaultRegistry, CATALOG_ID, {
  filter: catalogFilters.exclude('Table', 'Calendar'),
});

// Arbitrary predicate
const myFilter = getCatalogSchema(defaultRegistry, CATALOG_ID, {
  filter: (name) => name.startsWith('Custom'),
});
```

| Helper | Description |
| --- | --- |
| `catalogFilters.customOnly` | Keeps only components **not** in the base Vuetify catalog |
| `catalogFilters.only(...names)` | Keeps only the listed component names |
| `catalogFilters.exclude(...names)` | Keeps everything except the listed component names |

## Component catalog

40 components are registered in the default catalog. Most are backed by Vuetify 4; media types use native HTML5 elements where that fits the protocol.

### Content & display

| A2UI type    | Vuetify / HTML               | Notes                                                            |
| ------------ | ---------------------------- | ---------------------------------------------------------------- |
| `Text`       | `<div>` + typography classes | Maps `variant` (h1–h5, body, caption) to `text-h1`…`text-body-1` |
| `Image`      | `v-img`                      | `url`, `fit`, `variant`                                          |
| `Icon`       | `v-icon`                     | Material Design Icons                                            |
| `Divider`    | `v-divider`                  | Horizontal/vertical axis                                         |
| `Avatar`     | `v-avatar`                   |                                                                  |
| `Badge`      | `v-badge`                    |                                                                  |
| `Chip`       | `v-chip`                     |                                                                  |
| `Alert`      | `v-alert`                    |                                                                  |
| `Banner`     | `v-banner`                   |                                                                  |
| `EmptyState` | `v-empty-state`              |                                                                  |
| `Rating`     | `v-rating`                   |                                                                  |
| `Video`      | `<video>`                    | `url`, `controls`, `autoplay`, `loop`, `muted`                  |
| `AudioPlayer` | `<audio>`                    | Same media-style props as `Video`                               |

### Layout & containers

| A2UI type        | Vuetify component                  | Notes                                                      |
| ---------------- | ---------------------------------- | ---------------------------------------------------------- |
| `Row`            | `<div class="d-flex flex-row">`    | `justify`, `align` mapped to Vuetify flex utility classes  |
| `Column`         | `<div class="d-flex flex-column">` | Same flex mapping; child `weight` → `flex-grow-N`          |
| `List`           | `v-list`                           | Supports dynamic `{ path, componentId }` children          |
| `Card`           | `v-card`                           | Single `child` reference                                   |
| `Form`           | `v-form`                           | Wraps children                                             |
| `ExpansionPanel` | `v-expansion-panels`               |                                                            |
| `Tabs`           | `v-tabs` / `v-tabs-window`         | Tab titles and panel content per A2UI `tabs` array         |
| `Modal`          | `v-dialog`                         | `trigger` opens dialog; `content` is body                  |
| `Table`          | `v-data-table`                     | Auto-generates headers from data if `columns` not provided |
| `TreeView`       | `v-treeview`                       |                                                            |
| `Calendar`       | `v-calendar`                       |                                                            |

### Interactive & forms

| A2UI type      | Vuetify component            | Notes                                                                                               |
| -------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `Button`       | `v-btn`                      | `variant` → elevated/tonal/text; `action.event` triggers `sendAction`; `action.functionCall` logged |
| `TextField`    | `v-text-field`               | Two-way binding via `value.path`; `checks` → Vuetify rules                                          |
| `TextArea`     | `v-textarea`                 | Same binding pattern                                                                                |
| `NumberInput`  | `v-text-field type="number"` |                                                                                                     |
| `Checkbox`     | `v-checkbox`                 |                                                                                                     |
| `RadioButton`  | `v-radio-group` / `v-radio`  |                                                                                                     |
| `Select`       | `v-select`                   | `variant: "multipleSelection"` → `multiple` prop                                                    |
| `Autocomplete` | `v-autocomplete`             |                                                                                                     |
| `Combobox`     | `v-combobox`                 |                                                                                                     |
| `FileInput`    | `v-file-input`               |                                                                                                     |
| `Slider`       | `v-slider`                   |                                                                                                     |
| `RangeSlider`  | `v-range-slider`             |                                                                                                     |
| `DatePicker`   | `v-date-picker`              |                                                                                                     |
| `TimePicker`   | `v-time-picker`              |                                                                                                     |
| `ChoicePicker` | (delegates)                  | Maps A2UI choice semantics to `Select` / `RadioButton` / `Checkbox` based on variant and display style |

## Theming

`A2UIProvider` reads the `theme` object from `createSurface` and dynamically registers a Vuetify theme scoped to that surface. Supported theme properties:

- `primaryColor` → Vuetify `primary`
- `errorColor` → Vuetify `error`
- `backgroundColor` → Vuetify `background`
- `surfaceColor` → Vuetify `surface`

The theme is applied via `<v-theme-provider>` and automatically cleaned up when the provider unmounts.

## Custom components

### Registering & Scoping (catalogId)

To avoid collisions between disparate models, components must be registered against a specific `catalogId`. The renderer uses this ID (provided via `createSurface`) to securely sandbox standard and custom components.

```typescript
import { CATALOG_ID, defaultRegistry } from '@alis-build/a2ui-vuetify-renderer'
import MyMap from './components/MyMap.vue'

// Registering a synchronous custom component under the default catalog ID
defaultRegistry.register(CATALOG_ID, 'GoogleMap', MyMap)
```

### Lazy Loading

To optimize your initial bundle, you can register components asynchronously. Vue will load the chunk only when the A2UI server requests the component.

```typescript
import { defineAsyncComponent } from 'vue'

const AsyncMap = defineAsyncComponent(() => import('./components/MyMap.vue'))

defaultRegistry.register(CATALOG_ID, 'GoogleMap', AsyncMap)
```

## Transport Integration

While the A2UI Vue Renderer focuses solely on the UI layer, host applications must integrate it into an overarching transport channel (e.g., SSE, WebSockets, or a native bridge) and announce their capabilities.

### Client Capabilities

You must explicitly announce which `catalogId`s your renderer supports to the AI agent during the connection handshake. Failure to do so may result in the server sending unhandled component types.

```typescript
import { CATALOG_ID } from '@alis-build/a2ui-vuetify-renderer'

// Construct your metadata payload to be sent over your transport layer
const metadata = {
  a2uiClientCapabilities: {
    supportedCatalogIds: [CATALOG_ID, 'my-custom-catalog-v1']
  }
}
// Send metadata to the server...
```

### Authoring

Custom components receive a `node` prop (the component node from A2UI). To resolve data bindings (`path`, `call`, literals) for every field, use `useDynamicProps` with a ref, getter, or the node object (it uses Vue’s `toValue` internally):

```vue
<script setup lang="ts">
  import { toRef } from 'vue'
  import { useDynamicProps, useA2UI, type ComponentModel } from '@alis-build/a2ui-vuetify-renderer'

  const props = defineProps<{ node: ComponentModel }>()

  const dynamicProps = useDynamicProps(toRef(props, 'node'))

  const { sendAction, setData } = useA2UI()

  function handleClick(coords: { lat: number; lng: number }) {
    setData('/map/lastClick', coords)
    sendAction('map_clicked', props.node.id, coords)
  }
</script>

<template>
  <div class="custom-map">
    Latitude: {{ dynamicProps.lat }}
    Longitude: {{ dynamicProps.lng }}
    <v-btn @click="handleClick({ lat: 0, lng: 0 })">Click Map</v-btn>
  </div>
</template>
```

## Exports

Everything is available from the package root:

```typescript
// Components
import { A2UIProvider, ComponentNode } from '@alis-build/a2ui-vuetify-renderer'

// Composables
import { useA2UI, useDynamicProps } from '@alis-build/a2ui-vuetify-renderer'

// Registry & catalog bootstrap
import {
  ComponentRegistry,
  defaultRegistry,
  registerDefaultComponents,
  CATALOG_ID,
  VUETIFY_COMPONENTS,
  VUETIFY_FUNCTIONS,
  VUETIFY_THEME_SCHEMA,
  getCatalogSchema,
  catalogFilters,
} from '@alis-build/a2ui-vuetify-renderer'

// Plugin
import { A2UiVueRenderer } from '@alis-build/a2ui-vuetify-renderer'

// Types
import type { A2UIContext, A2UIActionPayload, A2UiVueRendererOptions, ComponentModel } from '@alis-build/a2ui-vuetify-renderer'

// Injection keys (for advanced provide/inject usage)
import { A2UI_CONTEXT_KEY, A2UI_REGISTRY_KEY } from '@alis-build/a2ui-vuetify-renderer'

// Styles (import in your app entry)
import '@alis-build/a2ui-vuetify-renderer/style.css'
```

## Development

```bash
git clone https://github.com/alis-exchange/a2ui-vuetify-renderer.git
pnpm install
```

| Command                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `pnpm dev`              | Start Vite dev server (playground under `examples/client`) |
| `pnpm build`            | Type-check with `vue-tsc` then build the library           |
| `pnpm test`             | Run Vitest test suite                                      |
| `pnpm generate:catalog` | Regenerate `catalog/vuetify-catalog.json` from sources     |

### Project structure

```
renderer/
├── catalog/
│   └── vuetify-catalog.json        # JSON Schema + catalogId for agents
├── examples/client/                # Vite app for manual integration testing
├── scripts/
│   └── generate-catalog.mjs        # Catalog JSON build script
├── src/
│   ├── index.ts                    # Public API barrel
│   ├── A2UIRendererPlugin.ts       # Vue plugin (install)
│   ├── style.css                   # Base styles
│   ├── catalog/
│   │   ├── index.ts                # Barrel for catalog exports
│   │   ├── vuetify-components.ts   # Zod-based ComponentApi[] for all Vuetify components
│   │   ├── vuetify-functions.ts    # FunctionImplementation[] (delegates to basic catalog)
│   │   └── vuetify-theme.ts        # Zod theme schema for Catalog constructor
│   ├── composables/
│   │   ├── A2UIProvider.vue        # Context provider + theme bridge
│   │   ├── useA2UI.ts              # Core composable
│   │   └── useDynamicProps.ts      # Resolved props helper for custom widgets
│   ├── core/
│   │   ├── ComponentNode.vue       # Recursive component renderer
│   │   ├── ComponentRegistry.ts    # Type → Component map (per catalogId)
│   │   ├── constants.ts            # CATALOG_ID
│   │   ├── defaultCatalog.ts       # Registers 40 default components
│   │   ├── getCatalogSchema.ts     # Schema merge for tooling / agents
│   │   └── catalogFilters.ts      # Pre-built filter predicates
│   ├── components/
│   │   └── A2UI*.vue               # Vuetify-backed (and media) implementations
│   └── utils/
│       └── validation.ts           # A2UI checks → Vuetify rules
├── dist/                           # Built library output
├── vite.config.ts                  # Vite lib mode + vuetify auto-import
├── vitest.config.ts                # Test config (jsdom, vuetify inlined)
└── tsconfig.json                   # Project references
```

### Testing

Tests use Vitest with `@vue/test-utils` and `jsdom`. Vuetify is inlined during tests via `vitest.config.ts`. Test files live alongside source as `*.spec.ts`:

- **Core** — plugin, provider, `useA2UI`, `useDynamicProps`, `ComponentNode`, `ComponentRegistry`, `getCatalogSchema`, barrel `index.spec.ts`
- **Components** — grouped specs (`CoreComponents`, `FormInputs`, …) plus focused tests for `Tabs`, `Modal`, `Video`, `AudioPlayer`, `ChoicePicker`
- **Tooling** — `scripts/generate-catalog.spec.ts`, `validation.spec.ts`

## License

[Apache 2.0](LICENSE)
