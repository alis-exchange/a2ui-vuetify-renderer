import { inject, type InjectionKey, computed } from 'vue';
import { DataContext } from '@a2ui/web_core/v0_9';

export interface A2UIContext {
  surfaceId: string;
  onAction: (action: any) => void;
  processor: any; // A2uiMessageProcessor
  dataContextPath?: string; // e.g. path in the data model
}

export const A2UI_CONTEXT_KEY: InjectionKey<A2UIContext> = Symbol('A2UI_CONTEXT_KEY');

export function useA2UI() {
  const context = inject(A2UI_CONTEXT_KEY);
  
  if (!context) {
    throw new Error('useA2UI must be used within an A2UIProvider');
  }

  const surface = context.processor?.model?.getSurface(context.surfaceId);
  const dataModel = surface?.dataModel;

  const dataContext = computed(() => {
    if (!dataModel) return undefined;
    return new DataContext(dataModel, context.dataContextPath || '/');
  });

  const resolveValue = (node: any) => {
    if (!dataContext.value || node === undefined) return node;
    return dataContext.value.resolveDynamicValue(node);
  };

  const resolveActionContext = (ctx: any) => {
    if (!ctx || typeof ctx !== 'object') return ctx;
    const resolved: Record<string, any> = {};
    for (const key in ctx) {
      resolved[key] = resolveValue(ctx[key]);
    }
    return resolved;
  };

  const resolveDynamicChildren = (childrenProp: any) => {
    if (Array.isArray(childrenProp)) {
      return childrenProp.map(child => {
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
            path: `${childrenProp.path}/${index}`
          };
        });
      }
    }

    return [];
  };

  const sendAction = (name: string, actionContext?: Record<string, any>) => {
    context.onAction({
      name,
      context: resolveActionContext(actionContext)
    });
  };

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
    setData
  };
}
