# A2UI Vuetify Renderer — Agent Guide

> `@alis-build/a2ui-vuetify-renderer` — a Vue 3 library that renders [A2UI Protocol v0.9](https://a2ui.org/specification/v0.9-a2ui/) JSON messages as interactive Vuetify 4 components.

---

## 1. What This Project Is

A **rendering library** (not an application). It consumes a JSONL stream of A2UI messages (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`) and turns them into live Vuetify UI. Protocol parsing, state management, and data binding are delegated to `@a2ui/web_core` v0.9; this package provides the Vue component layer on top.

```
Agent → JSONL stream → @a2ui/web_core (MessageProcessor) → Vue reactivity bridge → Vuetify 4 components
```

The library ships ESM, UMD, TypeScript declarations, and a CSS export. Host apps install it as a dependency and wire it to their transport layer (SSE, WebSockets, etc.).

---

## 2. Project Structure

```
renderer/
├── catalog/
│   └── vuetify-catalog.json          # Generated JSON Schema consumed by agents / tooling
├── examples/client/                   # Vite playground app for manual testing
├── scripts/
│   ├── generate-catalog.ts            # Builds vuetify-catalog.json from Zod schemas
│   └── generate-catalog.spec.ts
├── src/
│   ├── index.ts                       # Public barrel — all exports originate here
│   ├── index.spec.ts                  # Barrel export smoke tests
│   ├── A2UIRendererPlugin.ts          # Vue plugin: registers globals + fills registry
│   ├── A2UIRendererPlugin.spec.ts
│   ├── style.css                      # Minimal base styles
│   ├── catalog/
│   │   ├── index.ts                   # Re-exports components, functions, theme
│   │   ├── vuetify-components.ts      # Zod-based ComponentApi for every component
│   │   ├── vuetify-functions.ts       # FunctionImplementation[] (delegates to basic catalog)
│   │   └── vuetify-theme.ts           # Zod theme schema for Catalog constructor
│   ├── composables/
│   │   ├── A2UIProvider.vue           # Context provider + Vuetify theme bridge
│   │   ├── useA2UI.ts                 # Core composable: resolveValue, sendAction, setData, etc.
│   │   └── useDynamicProps.ts         # Resolves all node properties through resolveValue
│   ├── core/
│   │   ├── ComponentNode.vue          # Recursive renderer (<component :is="...">)
│   │   ├── ComponentRegistry.ts       # Map<catalogId, Map<type, Component>>
│   │   ├── catalogFilters.ts          # Predicate helpers for getCatalogSchema filtering
│   │   ├── constants.ts               # CATALOG_ID constant
│   │   ├── defaultCatalog.ts          # Registers 39 default components
│   │   └── getCatalogSchema.ts        # Merges base JSON Schema + custom stubs; supports filtering
│   ├── components/
│   │   └── A2UI*.vue                  # 39 Vuetify-backed component implementations
│   └── utils/
│       └── validation.ts              # A2UI checks → Vuetify rule functions
├── vite.config.ts                     # Library-mode build config
├── vitest.config.ts                   # Test config (jsdom, vuetify inlined)
├── tsconfig.json                      # Project references (tsconfig.app + tsconfig.node)
├── eslint.config.js                   # ESLint flat config
└── .prettierrc.json                   # Prettier config
```

---

## 3. Tech Stack & Dependencies

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (`^3.5.30`) with `<script setup>` + TypeScript |
| Component library | Vuetify 4 (`^4.0.2`) |
| Protocol core | `@a2ui/web_core` (`^0.9.0`) — message processing, state, data binding, validation |
| Schema | Zod (`^3.25`) + `zod-to-json-schema` for catalog generation |
| Build | Vite 8 library mode, `vite-plugin-vuetify` (auto-import), `vite-plugin-dts` |
| Tests | Vitest 4 + `@vue/test-utils` + jsdom |
| Linting | ESLint 9 flat config + `@vue/eslint-config-typescript` + oxlint + Prettier |
| Icons | `@mdi/font` (Material Design Icons) |

---

## 4. Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Vite dev server (playground at `examples/client`) |
| `pnpm build` | Type-check (`vue-tsc`) then Vite library build → `dist/` |
| `pnpm test` | Run full Vitest suite |
| `pnpm generate:catalog` | Regenerate `catalog/vuetify-catalog.json` from Zod schemas |
| `pnpm format` | Prettier on `src/`, `examples/`, `scripts/` |

---

## 5. Architecture Deep Dive

### 5.1 Entry point: `src/index.ts`

All public API is exported from this barrel. If you add a new public symbol, it must be exported here and covered in `index.spec.ts`.

### 5.2 Vue Plugin (`A2UIRendererPlugin.ts`)

- Globally registers `<A2uiProvider>` and `<A2uiComponentNode>`
- Calls `registerDefaultComponents()` to fill `defaultRegistry`
- Accepts optional `components` map for user overrides, merged via `registerAll`

### 5.3 A2UIProvider (`composables/A2UIProvider.vue`)

- Wraps a single surface. Receives `processor`, `surfaceId`, `onAction` props.
- Provides `A2UI_CONTEXT_KEY` to descendants via `provide/inject`.
- Listens to the processor's `update` event and increments a `shallowRef` key to trigger Vue re-renders.
- Reads `surface.theme` and dynamically creates a scoped Vuetify theme (`v-theme-provider`) mapping `primaryColor`, `errorColor`, `backgroundColor`, `surfaceColor` to Vuetify color tokens. Cleans up the theme on unmount.

### 5.4 ComponentNode (`core/ComponentNode.vue`)

The recursive heart of the renderer:
1. Injects `A2UI_CONTEXT_KEY` to get the processor and surface ID.
2. Looks up the component node by `id` from `SurfaceComponentsModel`.
3. Resolves the Vue component from the `ComponentRegistry` by type name + `catalogId`.
4. Renders via `<component :is="resolvedComponent" :node="node">`.
5. If the component type is unknown, renders a red error placeholder.
6. If the node doesn't exist yet, renders an orange "Missing node" debug box.
7. Supports `path` prop for dynamic list scoping — when provided, creates a new `A2UI_CONTEXT_KEY` with the scoped `dataContextPath`.
8. Applies `flex-grow-N` classes from the node's `weight` property.

### 5.5 ComponentRegistry (`core/ComponentRegistry.ts`)

A double-keyed map: `Map<catalogId, Map<typeName, Component>>` with a parallel map for `ComponentApi` schemas. Key methods:
- `register(catalogId, type, component, api?)` — single entry
- `registerAll(catalogId, components, apis?)` — batch
- `get(catalogId, type)` → `Component | undefined`
- `getApi(catalogId, type)` → `ComponentApi | undefined`
- `has(catalogId, type)` → boolean
- `keys(catalogId)` → `string[]`

The singleton `defaultRegistry` is pre-populated by `registerDefaultComponents()`.

### 5.6 useA2UI composable (`composables/useA2UI.ts`)

Provides the bridge between `@a2ui/web_core` state and Vue component logic. Returns:
- `resolveValue(node)` — resolves literal / `{ path }` / `{ call }` via `DataContext.resolveDynamicValue()`
- `resolveDynamicChildren(childrenProp)` — handles static ID arrays and `{ path, componentId }` template iteration
- `sendAction(name, sourceComponentId, context?)` — builds and dispatches actions (prefers `surface.dispatchAction()`, falls back to `onAction` callback)
- `dispatchNodeAction(node, extraContext?)` — reads `node.properties.action`, resolves `event` or warns on `functionCall`
- `setData(path, value)` — writes to the surface's `DataModel`
- `surfaceId`, `dataContextPath`, `dataContext`

### 5.7 useDynamicProps composable (`composables/useDynamicProps.ts`)

Accepts a `MaybeRefOrGetter<T>` node, returns a `computed` that runs every property through `resolveValue`. Designed for custom components that want automatic data binding without manually wrapping each property.

### 5.8 getCatalogSchema + catalogFilters

`getCatalogSchema(registry, catalogId, options?)` deep-clones the base `vuetify-catalog.json`, adds JSON Schema stubs for any registered-but-not-base components (using `ComponentApi` Zod schemas if available), and optionally filters the result via `options.filter`.

`catalogFilters` provides three convenience predicates:
- `customOnly` — excludes base catalog keys
- `only(...names)` — include-list
- `exclude(...names)` — exclude-list

### 5.9 Validation (`utils/validation.ts`)

`createVuetifyRules(checks)` converts A2UI `checks` arrays into Vuetify validation rule functions. Supports `required`, `regex`, `minLength`, `maxLength`, and arbitrary function checks.

---

## 6. Catalog System

### 6.1 The JSON Schema (`catalog/vuetify-catalog.json`)

A generated file — **never edit manually**. Contains:
- `$defs` for shared types (`DynamicString`, `ChildList`, `Action`, `Checkable`, `ComponentCommon`, `CatalogComponentCommon`, etc.)
- `components` map with a JSON Schema entry per A2UI type
- `functions` array with function schemas
- Metadata: `$schema`, `$id`, `catalogId`, `title`, `description`

### 6.2 Generating the catalog

Run `pnpm generate:catalog` (executes `scripts/generate-catalog.ts`):
1. Reads Zod schemas from `VUETIFY_COMPONENTS` and `VUETIFY_FUNCTIONS`
2. Converts each to JSON Schema via `zodToJsonSchema`
3. Merges with shared `$defs` and `ComponentCommon` / `CatalogComponentCommon` refs
4. Validates that every key in the generated catalog matches a registered component in `defaultCatalog.ts` (and vice versa). Exits non-zero on mismatch.
5. Writes to `catalog/vuetify-catalog.json`

### 6.3 Keeping catalog and components in sync

Whenever you add/remove a component:
1. Create/delete the `.vue` file in `src/components/`
2. Add/remove the Zod `ComponentApi` in `src/catalog/vuetify-components.ts` and include it in the `VUETIFY_COMPONENTS` array
3. Add/remove the registration in `src/core/defaultCatalog.ts`
4. Run `pnpm generate:catalog` — it will error if things are out of sync
5. Update tests

---

## 7. Component Conventions

### 7.1 File naming

All default components follow the pattern `A2UI<TypeName>.vue` (e.g. `A2UIButton.vue`, `A2UITextField.vue`).

### 7.2 Props contract

Every component receives a single `node` prop typed as `ComponentModel` (from `SurfaceComponentsModel['get']`). The node's properties are accessed via `node.properties.<key>`. Components **must not** receive individual A2UI properties as Vue props — everything flows through the `node` object.

### 7.3 Typical component pattern

```vue
<script setup lang="ts">
  import type { SurfaceComponentsModel } from '@a2ui/web_core/v0_9';
  import { computed } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  type ComponentModel = NonNullable<ReturnType<SurfaceComponentsModel['get']>>;

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, setData, dispatchNodeAction } = useA2UI();

  // Read properties through resolveValue (handles literals, paths, and function calls)
  const label = computed(() => resolveValue(props.node.properties.label));

  // Two-way binding for input components
  const valuePath = computed(() => props.node.properties.value?.path);
  const modelValue = computed({
    get() { return resolveValue(props.node.properties.value) ?? ''; },
    set(val: string) {
      if (valuePath.value) setData(valuePath.value, val);
    },
  });

  // Validation
  const rules = computed(() => {
    const checks = resolveValue(props.node.properties.checks);
    return createVuetifyRules(checks);
  });

  // Actions
  const handleClick = () => dispatchNodeAction(props.node);
</script>

<template>
  <v-text-field v-model="modelValue" :label="label" :rules="rules" />
</template>
```

Key patterns:
- **Always** use `resolveValue()` to read node properties — handles `{ path }` and `{ call }` bindings
- **Two-way binding**: use writable `computed` that calls `setData(path, val)` on set
- **Actions**: use `dispatchNodeAction(node)` for standard button/click actions, or `sendAction(name, id, context)` for manual payloads
- **Children**: use `<ComponentNode :id="childId" />` to render child references; use `resolveDynamicChildren` for iterating `{ path, componentId }` template lists
- **Validation**: pass `checks` through `createVuetifyRules()` to get Vuetify-compatible rule arrays

---

## 8. Testing

### 8.1 Setup

Tests use **Vitest** with `jsdom` environment and `@vue/test-utils`. Vuetify is inlined during tests via `vitest.config.ts` (`server.deps.inline: ['vuetify']`). Test files live alongside source as `*.spec.ts`.

### 8.2 Test categories

| Category | Files | What they cover |
|----------|-------|----------------|
| Core | `A2UIRendererPlugin.spec.ts`, `A2UIProvider.spec.ts`, `useA2UI.spec.ts`, `useDynamicProps.spec.ts`, `ComponentNode.spec.ts`, `ComponentRegistry.spec.ts` | Plugin install, context injection, value resolution, data binding, recursive rendering, registry CRUD |
| Schema | `getCatalogSchema.spec.ts`, `index.spec.ts` | Schema generation, filtering, barrel exports |
| Components | `CoreComponents.spec.ts`, `FormInputs.spec.ts`, `SelectionInputs.spec.ts`, `PickersAndSliders.spec.ts`, `DataDisplay.spec.ts`, `LayoutAndMisc.spec.ts`, `Feedback.spec.ts`, `Form.spec.ts`, `DynamicLists.spec.ts` | Grouped specs covering component rendering, props, events |
| Focused | `A2UITabs.spec.ts`, `A2UIModal.spec.ts`, `A2UIVideo.spec.ts`, `A2UIAudioPlayer.spec.ts`, `A2UIChoicePicker.spec.ts` | Complex components with specific interaction patterns |
| Utils | `validation.spec.ts` | Check-to-rule conversion |
| Tooling | `generate-catalog.spec.ts` | Catalog generation validation |

### 8.3 Running tests

```bash
pnpm test              # Full suite
npx vitest run <file>  # Single file
npx vitest --watch     # Watch mode
```

---

## 9. Code Style & Formatting

### 9.1 Prettier (`.prettierrc.json`)

- Single quotes, trailing commas, 2-space indent, semicolons
- `printWidth: 240` (wide)
- `singleAttributePerLine: true` for Vue templates
- `vueIndentScriptAndStyle: true`
- Uses `prettier-plugin-organize-imports`

### 9.2 ESLint (`eslint.config.js`)

ESLint 9 flat config with:
- `@vue/eslint-config-typescript` (recommended)
- `eslint-plugin-vue` flat/essential
- `eslint-plugin-oxlint`
- Prettier skip-formatting (Prettier handles formatting, ESLint handles logic)
- Notable rules: `@typescript-eslint/no-unused-vars: warn`, `import/no-unresolved: error`

### 9.3 TypeScript

- Strict mode enabled
- `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `erasableSyntaxOnly: true`
- DOM types via `@vue/tsconfig/tsconfig.dom.json`

---

## 10. Build & Distribution

### 10.1 Vite library build (`vite.config.ts`)

- Entry: `src/index.ts`
- Output: ESM (`dist/a2ui-vuetify-renderer.js`), UMD (`dist/a2ui-vuetify-renderer.umd.cjs`)
- External: `vue`, `vuetify`, `vuetify/components`, `vuetify/directives`, `@a2ui/web_core`
- TypeScript declarations via `vite-plugin-dts` → `dist/index.d.ts`
- CSS export: `dist/a2ui-vuetify-renderer.css`

### 10.2 Package exports

```json
{
  ".": { "import": "...", "require": "...", "types": "..." },
  "./style.css": "./dist/a2ui-vuetify-renderer.css"
}
```

---

## 11. Common Tasks

### Adding a new default component

1. Create `src/components/A2UI<Name>.vue` following the pattern in §7.3
2. Define a Zod `ComponentApi` in `src/catalog/vuetify-components.ts`, add it to the `VUETIFY_COMPONENTS` array
3. Import and register in `src/core/defaultCatalog.ts` inside `registerDefaultComponents()`
4. Run `pnpm generate:catalog` — it will validate alignment with the registry
5. Add tests (either in an existing grouped spec or a focused one)
6. Run `pnpm test` to confirm

### Adding a custom component (consumer-side)

1. Create the Vue component using `useA2UI()` or `useDynamicProps()`
2. Optionally define a `ComponentApi` with a Zod schema
3. Register with `defaultRegistry.register(CATALOG_ID, 'TypeName', component, api?)`
4. Use `getCatalogSchema(registry, catalogId)` to expose it to the LLM agent

### Modifying the catalog schema

**Never edit `catalog/vuetify-catalog.json` by hand.** Change the Zod schemas in `src/catalog/vuetify-components.ts` or the `$defs` in `scripts/generate-catalog.ts`, then run `pnpm generate:catalog`.

### Filtering the catalog for agents

```typescript
import { getCatalogSchema, catalogFilters, defaultRegistry, CATALOG_ID } from '@alis-build/a2ui-vuetify-renderer';

getCatalogSchema(defaultRegistry, CATALOG_ID, { filter: catalogFilters.customOnly });
getCatalogSchema(defaultRegistry, CATALOG_ID, { filter: catalogFilters.only('Button', 'Card') });
getCatalogSchema(defaultRegistry, CATALOG_ID, { filter: catalogFilters.exclude('Table') });
getCatalogSchema(defaultRegistry, CATALOG_ID, { filter: (name) => name.startsWith('Custom') });
```

---

## 12. Key Design Decisions

1. **Single `node` prop** — Components receive the full component model, not individual props. This keeps the interface uniform and lets `resolveValue` handle all binding types.

2. **Provide/inject over props drilling** — `A2UIProvider` provides context; components call `useA2UI()` to access the processor, data context, and action dispatchers. No prop threading through the tree.

3. **Reactive bridge via shallowRef key** — `A2UIProvider` listens to `web_core`'s `update` event and bumps a counter. The `:key="updateKey"` on the wrapper div forces Vue to re-evaluate computed properties. This is the bridge between web_core's event-based updates and Vue's reactivity.

4. **Registry per catalogId** — Components are scoped to a catalog ID, so different surfaces can use different catalogs without collision.

5. **Generated catalog schema** — The JSON Schema is derived from Zod schemas (single source of truth) and validated against the component registry at generation time. This guarantees agents always see an accurate schema.

6. **Vuetify auto-import** — `vite-plugin-vuetify` with `autoImport: true` means Vuetify components don't need explicit imports in `.vue` files. They're resolved at build time.

---

## 13. External References

| Resource | URL |
|----------|-----|
| A2UI v0.9 Specification | https://a2ui.org/specification/v0.9-a2ui/ |
| Renderer Development Guide | https://a2ui.org/guides/renderer-development/ |
| Component Gallery | https://a2ui.org/reference/components/ |
| `@a2ui/web_core` source | https://github.com/google/A2UI/tree/main/renderers/web_core |
| Vuetify 4 docs | https://vuetifyjs.com/ |
| Package on npm | https://www.npmjs.com/package/@alis-build/a2ui-vuetify-renderer |
| Repository | https://github.com/alis-exchange/a2ui-vuetify-renderer |
