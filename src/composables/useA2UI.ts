import { DataContext, type A2uiClientAction, type Action, type ComponentModel, type DynamicValue } from '@a2ui/web_core/v0_9';
import { computed, inject, type InjectionKey } from 'vue';

export type A2UIActionPayload = A2uiClientAction;

/**
 * The context object provided by {@link A2UIProvider} and consumed by {@link useA2UI}.
 *
 * This is an internal contract between the provider and the composable — component
 * authors should use {@link useA2UI} rather than injecting this directly.
 */
export interface A2UIContext {
  surfaceId: string;
  onAction: (action: A2UIActionPayload) => void;
  processor: any; // A2uiMessageProcessor
  dataContextPath?: string; // e.g. path in the data model
}

/** Vue injection key for the A2UI context. Provided by `A2UIProvider`, consumed by `useA2UI`. */
export const A2UI_CONTEXT_KEY: InjectionKey<A2UIContext> = Symbol('A2UI_CONTEXT_KEY');

/**
 * Core composable for A2UI component development.
 *
 * Provides reactive data resolution, action dispatching, and data mutation
 * within an A2UI surface. Must be called inside a component that is a descendant
 * of `<A2UIProvider>`.
 *
 * @returns An object containing:
 * - `surfaceId` — the ID of the current A2UI surface
 * - `dataContextPath` — the current data scope path (e.g. `/items/0`)
 * - `dataContext` — a computed `DataContext` for the current scope
 * - `resolveValue` — resolves a `DynamicValue` to its concrete value
 * - `resolveDynamicChildren` — resolves a `children` property into renderable child descriptors
 * - `sendAction` — dispatches a named event action to the server
 * - `dispatchNodeAction` — dispatches the action defined on a component node
 * - `setData` — writes a value into the data model
 *
 * @throws Error if called outside of an `<A2UIProvider>` ancestor
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import type { ComponentModel } from '@a2ui/web_core/v0_9';
 * import { computed } from 'vue';
 * import { useA2UI } from '../composables/useA2UI';
 *
 * const props = defineProps<{ node: ComponentModel }>();
 * const { resolveValue, dispatchNodeAction } = useA2UI();
 *
 * const label = computed(() => resolveValue<string>(props.node.properties.label));
 * const handleClick = () => dispatchNodeAction(props.node);
 * </script>
 * ```
 */
export function useA2UI() {
  const context = inject(A2UI_CONTEXT_KEY);

  if (!context) {
    throw new Error('useA2UI must be used within an A2UIProvider');
  }

  const surface = context.processor?.model?.getSurface(context.surfaceId);
  const dataModel = surface?.dataModel;

  const dataContext = computed(() => {
    if (!surface?.dataModel || !surface?.catalog) return undefined;
    return new DataContext(surface, context.dataContextPath || '/');
  });

  /**
   * Resolves a {@link DynamicValue} into its concrete runtime value.
   *
   * A `DynamicValue` can be:
   * - A **literal** (`string`, `number`, `boolean`, array) — returned as-is.
   * - A **data binding** (`{ path: "/some/path" }`) — looked up in the surface's data model.
   * - A **function call** (`{ call: "fnName", args: {...} }`) — evaluated via the catalog invoker.
   *
   * This is a one-shot, synchronous evaluation — it does not create reactive subscriptions.
   * Wrap calls in `computed()` to re-evaluate when the underlying data model changes.
   *
   * @typeParam V - The expected return type of the resolved value.
   * @param value - The dynamic value to resolve. If `undefined`, returns `undefined`.
   * @returns The resolved concrete value. If `value` is `undefined`, returns `undefined`.
   *          If the data context is not yet available, returns `value` unchanged (unresolved).
   *
   * @example
   * ```ts
   * const { resolveValue } = useA2UI();
   *
   * // Resolve a label that may be a literal string or a data binding
   * const label = computed(() => resolveValue<string>(props.node.properties.label));
   *
   * // Resolve with a fallback
   * const count = computed(() => resolveValue<number>(props.node.properties.count) ?? 0);
   * ```
   */
  const resolveValue = <V = unknown>(value: DynamicValue | undefined): V | undefined => {
    if (!dataContext.value || value === undefined) return value as V | undefined;
    return dataContext.value.resolveDynamicValue<V>(value);
  };

  /**
   * Resolves all values in an action context object by running each through {@link resolveValue}.
   *
   * Action context objects are key-value maps where each value may be a `DynamicValue`
   * (literal, data binding, or function call). This function resolves every entry to its
   * concrete value so the context can be sent to the server with actual data.
   *
   * @param ctx - A record of dynamic values to resolve. Returns the input unchanged if
   *              it is not a non-null object.
   * @returns A new object with all values resolved, or the original input if not an object.
   *
   * @example
   * ```ts
   * // Internally used by sendAction — typically not called directly.
   * // Given context: { userId: { path: "/user/id" }, action: "delete" }
   * // Returns:       { userId: "abc-123",            action: "delete" }
   * ```
   */
  const resolveActionContext = (ctx: any) => {
    if (!ctx || typeof ctx !== 'object') return ctx;
    const resolved: Record<string, any> = {};
    for (const key in ctx) {
      resolved[key] = resolveValue(ctx[key]);
    }
    return resolved;
  };

  /**
   * Resolves a component's `children` property into an array of renderable child descriptors.
   *
   * Handles two forms of children:
   *
   * 1. **Static list** — an array of component IDs or `{ id }` objects.
   *    Each entry is normalized to `{ id: string }`.
   *
   * 2. **Dynamic template** — an object with `{ path, componentId }` where `path` points to
   *    an array in the data model. Produces one child per array element, each with the same
   *    `componentId` and a scoped `path` (e.g. `/items/0`, `/items/1`, …) that becomes the
   *    child's `dataContextPath`.
   *
   * @param childrenProp - The raw `children` value from a component node's properties.
   * @returns An array of `{ id: string; path?: string }` objects suitable for rendering
   *          with `<ComponentNode>`.
   *
   * @example
   * ```vue
   * <script setup lang="ts">
   * const { resolveDynamicChildren } = useA2UI();
   *
   * const children = computed(() =>
   *   resolveDynamicChildren(props.node.properties.children)
   * );
   * </script>
   *
   * <template>
   *   <ComponentNode
   *     v-for="(child, i) in children"
   *     :key="child.id + i"
   *     :id="child.id"
   *     :path="child.path"
   *   />
   * </template>
   * ```
   */
  const resolveDynamicChildren = (childrenProp: any) => {
    if (Array.isArray(childrenProp)) {
      return childrenProp.map((child) => {
        if (typeof child === 'string') return { id: child };
        if (child && typeof child === 'object' && child.id) return { id: child.id };
        return child;
      });
    }

    if (childrenProp && typeof childrenProp === 'object' && childrenProp.path && childrenProp.componentId) {
      const resolvedArray = resolveValue({ path: childrenProp.path });
      if (Array.isArray(resolvedArray)) {
        return resolvedArray.map((_, index) => {
          return {
            id: childrenProp.componentId,
            path: `${childrenProp.path}/${index}`,
          };
        });
      }
    }

    return [];
  };

  /**
   * Dispatches a named event action, resolving any dynamic values in the context.
   *
   * If the surface supports `dispatchAction` (the standard path), the action is dispatched
   * through the surface's own action pipeline. Otherwise, it falls back to the `onAction`
   * callback provided by `<A2UIProvider>`, packaging the event into an {@link A2UIActionPayload}.
   *
   * In most cases, prefer {@link dispatchNodeAction} which reads the action definition
   * directly from a node. Use `sendAction` when you need to fire a custom event not
   * declared on a component node.
   *
   * @param name - The event name (e.g. `"submit"`, `"navigate"`).
   * @param sourceComponentId - The ID of the component that triggered the action.
   * @param actionContext - Optional key-value context. Values that are `DynamicValue` objects
   *                        (data bindings or function calls) are resolved before dispatching.
   *
   * @example
   * ```ts
   * const { sendAction } = useA2UI();
   *
   * // Fire a custom action with resolved context
   * sendAction('item-selected', props.node.id, {
   *   itemId: { path: '/selectedItem/id' },
   *   timestamp: new Date().toISOString(),
   * });
   * ```
   */
  const sendAction = (name: string, sourceComponentId: string, actionContext?: Record<string, any>) => {
    const resolvedContext = actionContext ? resolveActionContext(actionContext) : {};
    const actionPayload = { event: { name, context: resolvedContext } };

    if (surface && typeof surface.dispatchAction === 'function') {
      surface.dispatchAction(actionPayload, sourceComponentId);
    } else {
      const payload: A2UIActionPayload = {
        name,
        sourceComponentId,
        surfaceId: context.surfaceId,
        timestamp: new Date().toISOString(),
        context: resolvedContext,
      };
      context.onAction(payload);
    }
  };

  /**
   * Dispatches the action defined on a component node's `action` property.
   *
   * Reads `node.properties.action` (which is itself a `DynamicValue` that resolves to
   * an {@link Action}), then handles it based on its type:
   *
   * - **Event action** (`{ event: { name, context? } }`) — merges the action's own context
   *   with any `extraContext`, then calls {@link sendAction}.
   * - **Function call action** (`{ functionCall: { call, args } }`) — executes the function
   *   via the surface's catalog invoker (client-side only, not sent to the server).
   *
   * No-ops silently if the node has no `action` property.
   *
   * @param node - The component model whose action to dispatch.
   * @param extraContext - Additional key-value pairs to merge into the event context.
   *                       Only used for event actions; ignored for function calls.
   *
   * @example
   * ```ts
   * const { dispatchNodeAction } = useA2UI();
   *
   * // Dispatch a button's action on click
   * const handleClick = () => dispatchNodeAction(props.node);
   *
   * // Dispatch with extra runtime context (e.g. current input value)
   * const handleChange = (val: string) => {
   *   dispatchNodeAction(props.node, { value: val });
   * };
   * ```
   */
  const dispatchNodeAction = (node: ComponentModel, extraContext?: Record<string, any>) => {
    const action = resolveValue<Action | undefined>(node.properties.action);
    if (!action) return;

    if ('event' in action) {
      const mergedContext = {
        ...(action.event.context || {}),
        ...(extraContext || {}),
      };
      sendAction(action.event.name, node.id, mergedContext);
    } else if ('functionCall' in action) {
      dataContext.value?.resolveAction(action);
    }
  };

  /**
   * Writes a value into the surface's data model at the given path.
   *
   * Use this to persist user input (text fields, sliders, checkboxes, etc.) back
   * into the shared data model so that other components bound to the same path
   * react to the change.
   *
   * The path should be the absolute JSON Pointer from the data binding
   * (typically `node.properties.value.path`).
   *
   * @param path - An absolute JSON Pointer path in the data model (e.g. `"/form/email"`).
   * @param value - The value to store.
   *
   * @example
   * ```ts
   * const { resolveValue, setData } = useA2UI();
   *
   * const valuePath = computed(() => props.node.properties.value?.path);
   * const modelValue = computed({
   *   get: () => resolveValue<string>(props.node.properties.value) ?? '',
   *   set: (val) => { if (valuePath.value) setData(valuePath.value, val); },
   * });
   * ```
   */
  const setData = (path: string, value: any) => {
    if (dataModel) {
      dataModel.set(path, value);
    }
  };

  return {
    surfaceId: context.surfaceId,
    dataContextPath: context.dataContextPath,
    dataContext,
    resolveValue,
    resolveDynamicChildren,
    sendAction,
    dispatchNodeAction,
    setData,
  };
}
