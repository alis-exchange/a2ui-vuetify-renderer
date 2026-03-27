# A2UI Vuetify Renderer

[![npm](https://img.shields.io/npm/v/@alis-build/a2ui-vuetify-renderer)](https://www.npmjs.com/package/@alis-build/a2ui-vuetify-renderer)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

A Vue 3 rendering library for the [A2UI Protocol v0.9](https://a2ui.org/specification/v0.9-a2ui/). It translates A2UI JSON messages into interactive Vue interfaces backed by [Vuetify 4](https://vuetifyjs.com/) components.

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
| `@a2ui/web_core` | `^0.8.0`  |

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

If you prefer tree-shaking or local imports, skip the plugin and import `A2UIProvider` and `ComponentNode` directly — the default catalog is registered on first use.

## Quick start

```vue
<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { MessageProcessor, Catalog } from '@a2ui/web_core/v0_9'
  import type { Action } from '@a2ui/web_core/v0_9/schema'
  import { A2UIProvider, ComponentNode } from '@alis-build/a2ui-vuetify-renderer'

  const handleAction = (action: Action) => {
    console.log('Action from A2UI:', action)
  }

  const catalog = new Catalog('https://a2ui.org/specification/v0_9/basic_catalog.json', [])
  const processor = new MessageProcessor([catalog], handleAction)
  const surfaceId = 'demo-surface'
  const ready = ref(false)

  onMounted(() => {
    processor.processMessages([
      {
        createSurface: {
          surfaceId,
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
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
| **`useA2UI()`**            | Composable that injects the provider context. Returns `resolveValue`, `resolveDynamicChildren`, `sendAction`, `setData`, `surfaceId`, `dataContext`, and `dataContextPath`. Builds a `DataContext` from `@a2ui/web_core/v0_9` for path-based and function-call value resolution.                  |
| **`createVuetifyRules()`** | Converts A2UI `checks` arrays (`required`, `regex`, `minLength`, `maxLength`, custom functions) into Vuetify-compatible rule functions for form validation.                                                                                                                                       |

### Data flow

1. **Messages in** — `MessageProcessor.processMessages()` parses JSONL and updates `SurfaceModel` state (components, data model, theme).
2. **Reactivity bridge** — `A2UIProvider` subscribes to the processor's `update` event and increments a `shallowRef` key, causing Vue to re-render the subtree.
3. **Tree resolution** — `ComponentNode` reads the flat adjacency list from `SurfaceComponentsModel`, resolves `children`/`child`/`trigger`/`content` references, and recursively renders the tree.
4. **Value binding** — Components call `resolveValue()` which delegates to `DataContext.resolveDynamicValue()` — handling literals, `{ path }` lookups, and `{ call }` function expressions.
5. **Two-way binding** — Input components use writable `computed` properties that call `setData()` on the surface's `DataModel` when the user types.
6. **Actions out** — On user interaction (e.g. button click), components call `sendAction(name, context)` which resolves context values from the data model and invokes the `onAction` callback.

### Dynamic list rendering

When `children` is an object `{ path, componentId }` instead of an array, the renderer iterates the data model array at `path` and renders the template `componentId` for each item, passing a scoped `path` prop (`/items/0`, `/items/1`, ...) so child components resolve relative bindings correctly.

## Component catalog

34 components are registered in the default catalog, all backed by Vuetify 4:

### Content & display

| A2UI type    | Vuetify component            | Notes                                                            |
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

### Layout & containers

| A2UI type        | Vuetify component                  | Notes                                                      |
| ---------------- | ---------------------------------- | ---------------------------------------------------------- |
| `Row`            | `<div class="d-flex flex-row">`    | `justify`, `align` mapped to Vuetify flex utility classes  |
| `Column`         | `<div class="d-flex flex-column">` | Same flex mapping; child `weight` → `flex-grow-N`          |
| `List`           | `v-list`                           | Supports dynamic `{ path, componentId }` children          |
| `Card`           | `v-card`                           | Single `child` reference                                   |
| `Form`           | `v-form`                           | Wraps children                                             |
| `ExpansionPanel` | `v-expansion-panels`               |                                                            |
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

## Theming

`A2UIProvider` reads the `theme` object from `createSurface` and dynamically registers a Vuetify theme scoped to that surface. Supported theme properties:

- `primaryColor` → Vuetify `primary`
- `errorColor` → Vuetify `error`
- `backgroundColor` → Vuetify `background`
- `surfaceColor` → Vuetify `surface`

The theme is applied via `<v-theme-provider>` and automatically cleaned up when the provider unmounts.

## Custom components

### Registering

```typescript
import { defaultRegistry } from '@alis-build/a2ui-vuetify-renderer'
import MyMap from './components/MyMap.vue'

defaultRegistry.register('GoogleMap', MyMap)
```

### Authoring

Custom components receive a `node` prop (the `ComponentModel` from `@a2ui/web_core`) and use `useA2UI()` to interact with the A2UI context:

```vue
<script setup lang="ts">
  import { computed } from 'vue'
  import { useA2UI } from '@alis-build/a2ui-vuetify-renderer'
  import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9'
  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>

  const props = defineProps<{ node: ComponentModel }>()
  const { resolveValue, sendAction, setData } = useA2UI()

  const lat = computed(() => resolveValue(props.node.properties.lat))
  const lng = computed(() => resolveValue(props.node.properties.lng))

  function handleClick(coords: { lat: number; lng: number }) {
    setData('/map/lastClick', coords)
    sendAction('map_clicked', coords)
  }
</script>
```

## Exports

Everything is available from the package root:

```typescript
// Components
import { A2UIProvider, ComponentNode } from '@alis-build/a2ui-vuetify-renderer'

// Composable
import { useA2UI } from '@alis-build/a2ui-vuetify-renderer'

// Registry
import { ComponentRegistry, defaultRegistry } from '@alis-build/a2ui-vuetify-renderer'

// Plugin
import { A2UiVueRenderer } from '@alis-build/a2ui-vuetify-renderer'

// Types
import type { A2UIContext, A2UiVueRendererOptions } from '@alis-build/a2ui-vuetify-renderer'

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

| Command      | Description                                      |
| ------------ | ------------------------------------------------ |
| `pnpm dev`   | Start Vite dev server for manual testing         |
| `pnpm build` | Type-check with `vue-tsc` then build the library |
| `pnpm test`  | Run Vitest test suite                            |

### Project structure

```
renderer/
├── src/
│   ├── index.ts                    # Public API barrel
│   ├── A2UIRendererPlugin.ts       # Vue plugin (install)
│   ├── style.css                   # Base styles
│   ├── composables/
│   │   ├── A2UIProvider.vue        # Context provider + theme bridge
│   │   └── useA2UI.ts             # Core composable
│   ├── core/
│   │   ├── ComponentNode.vue       # Recursive component renderer
│   │   ├── ComponentRegistry.ts    # Type → Component map
│   │   └── defaultCatalog.ts       # Registers 34 default components
│   ├── components/
│   │   └── A2UI*.vue              # 34 Vuetify-backed component implementations
│   └── utils/
│       └── validation.ts           # A2UI checks → Vuetify rules
├── dist/                           # Built library output
├── vite.config.ts                  # Vite lib mode + vuetify auto-import
├── vitest.config.ts                # Test config (jsdom, vuetify inlined)
└── tsconfig.json                   # Project references
```

### Testing

Tests use Vitest with `@vue/test-utils` and `jsdom`. Vuetify is inlined during tests via `vitest.config.ts`. Test files live alongside source as `*.spec.ts`:

- **Core infrastructure** — `A2UIRendererPlugin.spec.ts`, `A2UIProvider.spec.ts`, `useA2UI.spec.ts`, `ComponentNode.spec.ts`, `ComponentRegistry.spec.ts`
- **Components** — `CoreComponents.spec.ts`, `FormInputs.spec.ts`, `SelectionInputs.spec.ts`, `PickersAndSliders.spec.ts`, `DataDisplay.spec.ts`, `Feedback.spec.ts`, `LayoutAndMisc.spec.ts`, `Form.spec.ts`, `DynamicLists.spec.ts`
- **Utilities** — `validation.spec.ts`

## License

[Apache 2.0](LICENSE)
