# A2UI Vuetify Renderer — Agent Guide

> `@alis-build/a2ui-vuetify-renderer` — a Vue 3 library that renders [A2UI Protocol v0.9](https://a2ui.org/specification/v0.9-a2ui/) JSON messages as interactive Vuetify 4 components.

---

## 1. What This Project Is

A **rendering library** (not an application). It consumes a JSONL stream of A2UI messages (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`) and turns them into live Vuetify UI. Protocol parsing, state management, and data binding are delegated to `@a2ui/web_core`; this package provides the Vue component layer on top. It speaks A2UI **v0.9, v0.9.1 and v1.0** with one set of 40 components: only the component schemas and the catalog document are built per version (see §5.12).

```
Agent → JSONL stream → @a2ui/web_core (MessageProcessor) → Vue reactivity bridge → Vuetify 4 components
```

The library ships ESM, UMD, TypeScript declarations, and a CSS export. Host apps install it as a dependency and wire it to their transport layer (SSE, WebSockets, etc.).

---

## 2. Project Structure

```
renderer/
├── catalog/
│   ├── vuetify-catalog.json          # Generated v0.9 catalog (hand-assembled from Zod), consumed by agents / tooling
│   └── vuetify-catalog.v1.json       # Generated v1.0 catalog (web_core Catalog.toJson())
├── examples/client/                   # Vite playground app for manual testing
├── scripts/
│   ├── generate-catalog.ts            # Builds both catalog documents; fails if either disagrees with the registry
│   └── generate-catalog.spec.ts
├── src/
│   ├── index.ts                       # Public barrel — all exports originate here
│   ├── index.spec.ts                  # Barrel export smoke tests
│   ├── A2UIRendererPlugin.ts          # Vue plugin: registers globals + fills registry
│   ├── A2UIRendererPlugin.spec.ts
│   ├── style.css                      # Minimal base styles
│   ├── catalog/
│   │   ├── index.ts                   # Re-exports components, functions, theme
│   │   ├── vuetify-components.ts      # VUETIFY_COMPONENTS (v0.9), VUETIFY_COMPONENTS_V1, buildVuetifyComponents(kit)
│   │   ├── vuetify-functions.ts       # createVuetifyFunctions({ locale, protocol }): basic catalog + Vuetify openUrl (http/https/mailto/tel)
│   │   └── vuetify-theme.ts           # Zod theme schema for Catalog constructor
│   ├── composables/
│   │   ├── A2UIProvider.vue           # Context provider + Vuetify theme bridge
│   │   ├── useA2UI.ts                 # Core composable: resolveValue<V>, sendAction, setData, etc.
│   │   ├── useBinding.ts              # Two-way binding through web_core's WritableBinding (any protocol version)
│   │   ├── useChecks.ts               # checks → Vuetify rules + binder isValid / validationErrors
│   │   ├── useChoiceInput.ts          # Shared by Select / Autocomplete / Combobox (internal)
│   │   ├── useInputVariant.ts         # Shared by TextField / TextArea / NumberInput (internal)
│   │   └── useDynamicProps.ts         # Resolves all node properties through resolveValue
│   ├── core/
│   │   ├── ComponentNode.vue          # Recursive renderer (<component :is="...">)
│   │   ├── ComponentRegistry.ts       # Map<catalogId, Map<type, Component>>
│   │   ├── catalogFilters.ts          # Predicate helpers for getCatalogSchema filtering
│   │   ├── constants.ts               # CATALOG_ID, CATALOG_ID_V1
│   │   ├── catalogDocumentV1.ts       # buildCatalogDocumentV1(apis): the v1.0 document via Catalog.toJson()
│   │   ├── zodToCatalogJson.ts        # Zod → inline JSON Schema for the v0.9 document (collapses FunctionCall args)
│   │   ├── defaultCatalog.ts          # BUILT_IN_COMPONENTS (typed against COMPONENT_BUILDERS) + registerDefaultComponents(registry?)
│   │   └── getCatalogSchema.ts        # Merges base JSON Schema + custom stubs; supports filtering
│   ├── components/
│   │   ├── A2UI*.vue                  # 40 Vuetify-backed component implementations
│   │   └── A2UI*.api.ts               # build<Name>Api(kit): each schema written once, built per protocol
│   ├── protocol/
│   │   ├── kits.ts                    # A2UI_V09 / A2UI_V10: web_core schemas per protocol family
│   │   ├── version.ts                 # isV10Surface(surface)
│   │   └── legacyBindings.ts          # findLegacyBindings: v0.9 { path } / { call } on a v1.0 surface
│   └── utils/
│       ├── mediaUrl.ts                # safeMediaUrl: the A2UI media URL rule (Image, Avatar, Video, AudioPlayer)
│       └── validation.ts              # A2UI checks ({ condition, message }) → Vuetify rule functions
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
| Framework | Vue 3 (`^3.5.35`) with `<script setup>` + TypeScript 6 (TS 7 has no JS API, so `vue-tsc` cannot run on it yet) |
| Component library | Vuetify 4 (`^4.1.1`) |
| Protocol core | `@a2ui/web_core` (`^0.15.0`) — message processing, state, data binding, validation |
| Schema | Zod (`^3.25`) + `zod-to-json-schema` for catalog generation |
| Build | Vite 8 library mode, `vite-plugin-vuetify` (auto-import), `vite-plugin-dts` |
| Tests | Vitest 5 + `@vue/test-utils` + jsdom |
| Linting | ESLint 10 flat config + `@vue/eslint-config-typescript` + oxlint + Prettier |
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
- Calls `registerDefaultComponents(registry)` to fill `defaultRegistry`, or the app's own registry when the `registry` option is given (then provided under `A2UI_REGISTRY_KEY`)
- Accepts optional `components` map for user overrides, merged via `registerAll`

### 5.3 A2UIProvider (`composables/A2UIProvider.vue`)

- Wraps a single surface. Receives `processor`, `surfaceId`, `onAction`, `onError` and `nodeResolver` (default `true`) props.
- Provides `A2UI_CONTEXT_KEY` to descendants via `provide/inject`, handing out the **raw** processor (`toRaw`), never Vue's reactive proxy, because web_core's signals and identity checks must see the real objects.
- Subscribes to `processor.model.onSurfaceCreated` / `onSurfaceDeleted` (the only lifecycle events web_core emits; `MessageProcessor` is not an `EventTarget`). When the surface exists it creates one `NodeResolver(surface, surface.defaultCatalog)` (`catalog` is a deprecated alias since web_core 0.12), exposed as `context.resolver`, and disposes it on delete/unmount.
- Both handlers check the model rather than trusting the event. `EventEmitter.emit` awaits each listener, so a handler can run a microtask late: a `deleted` that arrives after the surface was recreated would otherwise dispose the live resolver, and a provider that mounts mid-emit would attach the same surface twice. `deleted` is ignored while `model.getSurface(id)` still returns a surface; `created` is ignored when it names the surface already attached.
- The `NodeResolver` constructor builds the tree eagerly, so an unbindable surface throws there. That is caught and reported through `onError`, leaving the subtree on the static path — without it the throw escapes `setup()` and the provider renders nothing whenever the surface already existed at mount. Note the asymmetry that remains: the same bad binding arriving *after* mount is swallowed by web_core's emitter and never reaches `onError`.
- A v1.0 surface always gets a `NodeResolver`, even with `nodeResolver=false` (the legacy path only understands v0.9; it warns once), and even with no default catalog (v1.0 `createSurface` may omit `catalogId`; each component names its own).
- Forwards `surface.onError` events to `onError` (or `console.error`).
- Reads `surface.theme` (v0.9 only: web_core rejects `theme` on a v1.0 `createSurface`) and dynamically creates a scoped Vuetify theme (`v-theme-provider`) mapping `primaryColor`, `errorColor`, `backgroundColor`, `surfaceColor` to Vuetify color tokens. Cleans up the theme on unmount.

### 5.4 ComponentNode (`core/ComponentNode.vue`)

The recursive heart of the renderer:
1. Injects `A2UI_CONTEXT_KEY` to get the processor, surface ID, resolver and the parent's `nodeProps`.
2. Finds its live web_core node: `id="root"` directly under the provider reads `resolver.rootNode`; any other `id` is found with `findLiveNode(parentNodeProps, id, path)` (`core/liveNodes.ts`: single refs, child lists, template items by data path, `tabs[].child`). Containers keep passing ids, which is why none of the 40 components needed changes.
3. Mirrors the node's `props` signal into a `shallowRef` (`effect` + `getValue`) and provides it as `nodeProps`, with `dataContextPath = node.dataPath`. `resolveValue` / `resolveDynamicChildren` read `nodeProps`, so every computed built on them re-runs when web_core reports a change.
4. Reads the raw `ComponentModel` from `SurfaceComponentsModel` (components still resolve raw properties one-shot) and resolves the Vue component from the `ComponentRegistry` by type name + the node's own catalog (`ComponentModel.catalog.id`; v1.0 lets a component choose), falling back to `CATALOG_ID` so a host that named its catalog differently keeps rendering.
   On a v1.0 surface it also checks each component version once for v0.9 syntax (`findLegacyBindings`) and dispatches a `VALIDATION_FAILED` surface error, because web_core's v1.0 validation lets `{ path }` through and then treats it as a literal.
5. Renders via `<component :is="resolvedComponent" :node="node">`.
6. `pending` / `cyclic` nodes render a `[state: id]` placeholder and are swapped in place when resolvable; `unknown-type` nodes still try the registry (custom components outside the catalog), else the red error fallback.
7. Without a live node (legacy path, `nodeResolver=false`) it falls back to the static lookup by `id`; a missing node renders the orange "Missing node" debug box; `path` scopes descendants.
8. Applies `flex-grow-N` classes from the node's `weight` property.

### 5.5 ComponentRegistry (`core/ComponentRegistry.ts`)

A double-keyed map: `Map<catalogId, Map<typeName, Component>>` with a parallel map for `ComponentApi` schemas. `CATALOG_ID_V1` is an alias of `CATALOG_ID` for components (one Vue component renders on both versions) while `ComponentApi`s stay per id. Key methods:
- `register(catalogId, type, component, api?)` — single entry
- `registerApi(catalogId, type, api)` — a schema only, e.g. the v1.0 one for a component already registered
- `registerAll(catalogId, components, apis?)` — batch
- `get(catalogId, type)` → `Component | undefined`
- `getApi(catalogId, type)` → `ComponentApi | undefined`
- `has(catalogId, type)` → boolean
- `keys(catalogId)` → `string[]`

The shared `defaultRegistry` is filled by `registerDefaultComponents()`; pass another registry (`registerDefaultComponents(myRegistry)`, or the plugin's `registry` option) to keep an app's components separate.

### 5.6 useA2UI composable (`composables/useA2UI.ts`)

Provides the bridge between `@a2ui/web_core` state and Vue component logic. The function signature is `useA2UI(): UseA2UIReturn`. The explicit return type interface is required so that JSDoc on each member survives into the generated `.d.ts` — see §12.7.

`UseA2UIReturn` members:
- `resolveValue<V = unknown>(value: DynamicValue | undefined): V | undefined` — resolves literal / `{ path }` / `{ call }` via `DataContext.resolveDynamicValue<V>()`; `DynamicValue` is from `@a2ui/web_core/v0_9`. Pass `V` explicitly for each property (e.g. `resolveValue<string>(props.node.properties.label)`).
- `resolveDynamicChildren(childrenProp)` — handles static ID arrays and `{ path, componentId }` template iteration
- `sendAction(name, sourceComponentId, context?)` — builds and dispatches actions (prefers `surface.dispatchAction()`, falls back to `onAction` callback)
- `dispatchNodeAction(node: ComponentModel, extraContext?)` — reads `node.properties.action`, resolves with `resolveValue<Action | undefined>`, then dispatches `event` or executes `functionCall` locally
- `setData(path, value)` — writes to the surface's `DataModel`
- `surfaceId`, `dataContextPath`, `dataContext`
- `nodeProps` — `ShallowRef` of the enclosing node's resolved props in node mode (`undefined` value on the legacy path). It carries the binder outputs `isValid` / `validationErrors`, but read those through [5.7 `useChecks`](#57-usechecks-composable-composablesusechecksts) rather than directly; `resolveValue` already subscribes to it.

### 5.7 useChecks composable (`composables/useChecks.ts`)

`useChecks(node)` returns `rules` (via `createVuetifyRules(checks, resolveValue)`), `isValid` and `validationErrors` (from `nodeProps` in node mode; `true` / `undefined` on the legacy path) and `errorMessages(value)` (the binder's messages when it reports any, else the rules run against `value`). Button/IconButton gate on `isValid`; Slider shows `error-messages` and passes `rules` only while the binder reports no failures (Vuetify caches rule results until the input's own model changes, so a stale message would survive a cross-field check clearing); DatePicker renders `errorMessages(modelValue)`. Every input component goes through `useChecks` — custom components should too, rather than reading `nodeProps` or calling `createVuetifyRules` directly.

Note that the binder and `createVuetifyRules` are two independent evaluations of the same `checks` and can disagree: before web_core 0.15 the binder read `rule.condition || rule`, so a literal `condition: false` fell back to the truthy rule object and was reported as passing (fixed upstream in 0.15; the guard stays as defence in depth). `errorMessages` therefore treats only a *non-empty* `validationErrors` as authoritative. Do not hand Vuetify both `rules` and `error-messages` for the same node.

### 5.8 useDynamicProps composable (`composables/useDynamicProps.ts`)

Accepts a `MaybeRefOrGetter<T>` node, returns a `computed` that runs every property through `resolveValue` (same generic function as `useA2UI`). Designed for custom components that want automatic data binding without manually wrapping each property; use `resolveValue<V>()` on individual `node.properties` fields when you need a concrete `V`.

### 5.9 getCatalogSchema + catalogFilters

`getCatalogSchema(registry, catalogId, options?)` deep-clones the base `vuetify-catalog.json`, adds JSON Schema stubs for any registered-but-not-base components (using `ComponentApi` Zod schemas if available), and optionally filters the result via `options.filter`.

For `CATALOG_ID_V1` it instead rebuilds the v1.0 document with `buildCatalogDocumentV1` from the built-in v1.0 APIs plus each custom type's registered v1.0 API, applying the filter first so `$defs.anyComponent` matches. A custom type with no v1.0 API is left out with a `console.warn`.

`catalogFilters` provides three convenience predicates:
- `customOnly` — excludes base catalog keys
- `only(...names)` — include-list
- `exclude(...names)` — exclude-list

### 5.10 Validation (`utils/validation.ts`)

`createVuetifyRules(checks, resolveValue)` converts A2UI `checks` arrays into Vuetify validation rule functions.

- **Protocol shape** (what agents send, enforced by web_core's `CheckRuleSchema`): `{ condition: DynamicBoolean, message }`. `condition` is a literal boolean, `{ path }` or `{ call, args }`; it is resolved with `resolveValue` (from `useA2UI()`) every time the rule runs, so it reads the live data model. The resolved value is read exactly as web_core's `GenericBinder.extractValidationResult` reads it (`readCheckOutcome` mirrors it; keep them in step on upgrades): a v1.0 `ValidationResult` fails only when `valid` is false with severity `error` (warnings and info never block), anything else fails when falsy. A function-call condition shows the rule's `message`; a path-bound one prefers the result's `message`; the fallback is `Validation failed`. A missing resolver or a resolver that throws counts as a pass: a broken rule must never lock the user out of an input.
- **Legacy shapes** (`'required'`, `{ type: 'required' | 'regex' | 'minLength' | 'maxLength' }`, raw functions) still work for direct callers, but `MessageProcessor` (web_core ≥ 0.10.6) rejects them before they reach a component.

### 5.11 Catalog functions (`catalog/vuetify-functions.ts`)

`createVuetifyFunctions({ locale, protocol })` builds the `FunctionImplementation[]` from web_core's `createBasicCatalogFunctions` (v0.9, default) or its v1.0 counterpart in `@a2ui/web_core/catalogs/basic/v1` (`protocol: A2UI_V10`: validators return `ValidationResult`s, no legacy math helpers, `@index` included) and swaps `openUrl` for `VuetifyOpenUrlImplementation` (allows `http:`, `https:`, `mailto:`, `tel:`; everything else throws `A2uiExpressionError` like upstream). It is `allowedCallers: 'rendererOnly'` + `requiresUserActivation: true`: agents cannot call it and bindings/checks cannot evaluate it, only user-triggered actions; `src/nodeResolver.spec.ts` covers the click path. The generator reads both flags off the implementation, so never set them only in the JSON. Replace by name, never append: the generator iterates the array. `VUETIFY_FUNCTIONS` is `createVuetifyFunctions()`, `VUETIFY_FUNCTIONS_V1` the v1.0 set with `VuetifyOpenUrlImplementationV1` (same body; keeping `mailto:`/`tel:` on v1.0 goes beyond that spec on purpose).

### 5.12 Protocol versions (`protocol/kits.ts`)

A **protocol kit** (`A2UI_V09` for v0.9 and v0.9.1, `A2UI_V10`) hands a schema builder the web_core building blocks for one family: `/v0_9` and `/v1_0` export them under the same names, so `build<Name>Api(kit)` is written once and validates `{ path }` on v0.9 and `{ "@path" }` on v1.0. `kit.commonProps` is `{ accessibility, weight }` on v0.9 and `{ weight }` on v1.0 (`accessibility`, `catalogId`, `metadata` are envelope keys there and must not be declared; `weight` must). `kit.PathBinding` covers props that accept a bare binding (Icon `name`, RangeSlider `value`). Rules that follow:

- Never read `properties.<prop>.path` or build `{ path }` by hand at runtime: v1.0 treats a bare `{ path }` as a literal. Bind inputs with `useBinding`; when you must build a binding, check `dataContext.atLeastV10` (see `resolveDynamicChildren`).
- ChildList templates keep the unprefixed `{ componentId, path }` in every version.
- v0.9.1 needs nothing of its own: web_core accepts `version: "v0.9.1"` against the v0.9 catalog.
- `src/protocols.spec.ts` runs one surface as v0.9, v0.9.1 and v1.0 through a processor holding both catalogs; extend it when a behaviour should hold on every version.

---

## 6. Catalog System

Since `@a2ui/web_core` 0.10.6, `MessageProcessor.processMessages` validates every `updateComponents` component against its Zod schema (all Vuetify schemas are `.strict()`) before mutating state and throws `A2uiValidationError` for the whole message on the first failure. `src/catalog/catalog.spec.ts` pins this behaviour.

### 6.1 The JSON Schemas (`catalog/vuetify-catalog.json`, `catalog/vuetify-catalog.v1.json`)

Generated files — **never edit manually**. The v1.0 document is written by web_core (`Catalog.toJson()` via `buildCatalogDocumentV1`) and references `common_types.json`, so it is a fraction of the size; the v0.9 document below is hand-assembled and must stay byte-stable (`generate-catalog.spec.ts` fails on either being stale). The v0.9 one contains:
- `$defs` for shared types (`DynamicString`, `ChildList`, `Action`, `ComponentCommon`, `CatalogComponentCommon`, etc.). `checks` is inlined per component from web_core's `CheckRuleSchema` (`{ condition, message }`).
- `components` map with a JSON Schema entry per A2UI type
- `functions` array with function schemas
- Metadata: `$schema`, `$id`, `catalogId`, `title`, `description`

### 6.2 Generating the catalog

Run `pnpm generate:catalog` (executes `scripts/generate-catalog.ts`):
1. Reads Zod schemas from `VUETIFY_COMPONENTS` and `VUETIFY_FUNCTIONS`
2. Converts each to JSON Schema via `zodToJsonSchema`
3. Merges with shared `$defs` and `ComponentCommon` / `CatalogComponentCommon` refs
4. Validates that every key in the generated catalog matches `COMPONENT_BUILDERS` (and vice versa). Exits non-zero on mismatch. The Vue side needs no check here: `defaultCatalog.ts` is typed against the same names, so it fails to compile when out of sync.
5. Writes to `catalog/vuetify-catalog.json`
6. Builds the v1.0 document from `VUETIFY_COMPONENTS_V1` / `VUETIFY_FUNCTIONS_V1`, loads it back with `Catalog.fromJson(doc, '1.0')` as validation, checks it against the registry and writes `catalog/vuetify-catalog.v1.json`

### 6.3 Keeping catalog and components in sync

Whenever you add/remove a component:
1. Create/delete the `.vue` file in `src/components/`
2. Add/remove `src/components/A2UI<Name>.api.ts` (`build<Name>Api(kit)`) and its entry in `COMPONENT_BUILDERS` (`src/catalog/vuetify-components.ts`, the one list of built-ins)
3. Add/remove the Vue component in `BUILT_IN_COMPONENTS` (`src/core/defaultCatalog.ts`); `vue-tsc` fails until steps 2 and 3 agree
4. Run `pnpm generate:catalog`
5. Update tests

---

## 7. Component Conventions

### 7.1 File naming

All default components follow the pattern `A2UI<TypeName>.vue` (e.g. `A2UIButton.vue`, `A2UITextField.vue`).

### 7.2 Props contract

Every component receives a single `node` prop typed as `ComponentModel` from `@a2ui/web_core/v0_9`. The node's properties are accessed via `node.properties.<key>`. Components **must not** receive individual A2UI properties as Vue props — everything flows through the `node` object.

### 7.3 Typical component pattern

```vue
<script setup lang="ts">
 import type { ComponentModel } from '@a2ui/web_core/v0_9';
 import { computed } from 'vue';
 import { useA2UI } from '../composables/useA2UI';
 import { useBinding } from '../composables/useBinding';
 import { useChecks } from '../composables/useChecks';

 const props = defineProps<{
 node: ComponentModel;
 }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();

  // Read properties through resolveValue<V> (handles literals, paths, and function calls)
  const label = computed(() => resolveValue<string | undefined>(props.node.properties.label));

  // Two-way binding for input components: never read `.path` yourself (v1.0 spells it `@path`)
  const modelValue = useBinding<string>(() => props.node, 'value', '');

  // Validation — useChecks also exposes the binder's isValid / validationErrors
  const { rules } = useChecks(() => props.node);

  // Actions
  const handleClick = () => dispatchNodeAction(props.node);
</script>

<template>
  <v-text-field v-model="modelValue" :label="label" :rules="rules" />
</template>
```

Key patterns:
- **Always** use `resolveValue<V>()` to read node properties — handles `{ path }` and `{ call }` bindings; choose `V` to match the resolved runtime type
- **Two-way binding**: `useBinding<T>(() => props.node, 'value', fallback)` returns a writable computed. In node mode it writes through the `WritableBinding` web_core's `NodeResolver` puts in the node's props (its `set` goes through the node's `DataContext`; legacy path: the raw binding's path, same `DataContext`), so the same code handles v0.9 `{ path }`, v1.0 `{ "@path" }` and relative paths in template rows. Never read `properties.value.path` and call `setData` yourself: that breaks on v1.0 and wrote template rows to the root on v0.9. Wrap it in your own `computed` when a write needs extra work (coercion, an action)
- **Actions**: use `dispatchNodeAction(node)` for standard button/click actions, or `sendAction(name, id, context)` for manual payloads
- **Children**: use `<ComponentNode :id="childId" />` to render child references; use `resolveDynamicChildren` for iterating `{ path, componentId }` template lists
- **Validation**: call `useChecks(() => props.node)` (see 5.7) — it builds the `createVuetifyRules` rules so `{ condition, message }` conditions resolve against the data model, and exposes the binder's `isValid` / `validationErrors` for gating (Button, IconButton). Do not read `nodeProps` or call `createVuetifyRules` directly in a component
- **Prompt-friendly schemas**: A2UI Express (the agent SDK's compact inference format, `@a2ui/agent`) passes props **by position in declaration order** and shows the schema's description beside each signature. So declare the component's own props first, most important first, and spread `...kit.commonProps` **last**; end every schema with `.describe('<one line: what it is and when to use it>')`. `generate-catalog.spec.ts` fails otherwise, and `src/catalog/express.spec.ts` runs the real `@a2ui/agent` (dev dependency) against both published documents: prompt signatures, and Express compiled into messages that render. Reordering props changes Express argument positions for agents, so treat it like an API change.
- **Schemas**: keep every `ComponentApi.schema` a plain `z.object({...}).strict()` (`.describe()` after `.strict()` is fine; it keeps the shape). A `.refine()` / `.transform()` root wraps it in a `ZodEffects` that web_core's binder cannot read, turning every prop static (no action closures, no `isValid`); `src/catalog/catalog.spec.ts` guards this

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
| Protocols | `protocols.spec.ts`, `nodeResolver.spec.ts`, `catalog.spec.ts`, `protocol/legacyBindings.spec.ts` | One surface on v0.9 / v0.9.1 / v1.0, binding, checks, openUrl gating, per-version schemas under a real `MessageProcessor` |
| Utils | `validation.spec.ts`, `mediaUrl.spec.ts`, `MediaUrls.spec.ts` | Check-to-rule conversion (incl. `ValidationResult`), media URL rule |
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
  "./style.css": "./dist/a2ui-vuetify-renderer.css",
  "./catalog": "./catalog/vuetify-catalog.json",
  "./catalog/v1": "./catalog/vuetify-catalog.v1.json"
}
```

---

## 11. Common Tasks

### Adding a new default component

1. Create `src/components/A2UI<Name>.vue` following the pattern in §7.3
2. Write `src/components/A2UI<Name>.api.ts` as `build<Name>Api(kit)` (kit schemas only, own props first, `...kit.commonProps` last, `.strict().describe('…')`) and add it to `COMPONENT_BUILDERS` in `src/catalog/vuetify-components.ts`
3. Add the Vue component to `BUILT_IN_COMPONENTS` in `src/core/defaultCatalog.ts` (the compiler requires it once step 2 is done)
4. Run `pnpm generate:catalog` — it will validate alignment with the registry
5. Add tests (either in an existing grouped spec or a focused one)
6. Run `pnpm test` to confirm

### Adding a custom component (consumer-side)

1. Create the Vue component using `useA2UI()` or `useDynamicProps()`
2. Optionally define its schema as a builder `(kit: ProtocolKit) => ComponentApi`
3. Register with `defaultRegistry.register(CATALOG_ID, 'TypeName', component, build(A2UI_V09))`, and `defaultRegistry.registerApi(CATALOG_ID_V1, 'TypeName', build(A2UI_V10))` for v1.0
4. Use `getCatalogSchema(registry, CATALOG_ID)` / `getCatalogSchema(registry, CATALOG_ID_V1)` to expose it to the LLM agent

### Modifying the catalog schema

**Never edit `catalog/vuetify-catalog.json` or `catalog/vuetify-catalog.v1.json` by hand.** Change the Zod schemas in `src/catalog/vuetify-components.ts` or the `$defs` in `scripts/generate-catalog.ts`, then run `pnpm generate:catalog`.

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

1. **Single `node` prop** — Components receive the full component model, not individual props. This keeps the interface uniform and lets `resolveValue<V>()` handle all binding types with an explicit resolved type per field.

2. **Provide/inject over props drilling** — `A2UIProvider` provides context; components call `useA2UI()` to access the processor, data context, and action dispatchers. No prop threading through the tree.

3. **Reactive bridge via shallowRef key** — `A2UIProvider` listens to `web_core`'s `update` event and bumps a counter. The `:key="updateKey"` on the wrapper div forces Vue to re-evaluate computed properties. This is the bridge between web_core's event-based updates and Vue's reactivity.

4. **Registry per catalogId** — Components are scoped to a catalog ID, so different surfaces can use different catalogs without collision.

5. **Generated catalog schema** — The JSON Schema is derived from Zod schemas (single source of truth) and validated against the component registry at generation time. This guarantees agents always see an accurate schema.

6. **Vuetify auto-import** — `vite-plugin-vuetify` with `autoImport: true` means Vuetify components don't need explicit imports in `.vue` files. They're resolved at build time.

7. **Explicit return type interfaces for composables** — When a composable returns an object with multiple members (like `useA2UI`), JSDoc on inner `const` declarations does **not** survive into the generated `.d.ts` file. TypeScript infers the return type structurally and strips the JSDoc. To ensure consumers see documentation when hovering over destructured members (e.g. `resolveValue`, `sendAction`), the composable must define an exported interface (e.g. `UseA2UIReturn`) with JSDoc on each property, and annotate the function return type explicitly. The JSDoc lives on the interface, not on the inner implementations. If you add a new composable that returns a multi-member object, follow this same pattern.

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
