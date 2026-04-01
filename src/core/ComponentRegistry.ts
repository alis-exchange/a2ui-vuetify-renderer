import type { ComponentApi } from '@a2ui/web_core/v0_9';
import type { Component, InjectionKey } from 'vue';

export const A2UI_REGISTRY_KEY: InjectionKey<ComponentRegistry> = Symbol('A2UI_REGISTRY_KEY');

export class ComponentRegistry {
  private catalogs: Map<string, Map<string, Component>> = new Map();
  private apis: Map<string, Map<string, ComponentApi>> = new Map();

  register(catalogId: string, type: string, component: Component, api?: ComponentApi) {
    if (!this.catalogs.has(catalogId)) {
      this.catalogs.set(catalogId, new Map());
      this.apis.set(catalogId, new Map());
    }
    this.catalogs.get(catalogId)!.set(type, component);
    if (api) {
      this.apis.get(catalogId)!.set(type, api);
    }
  }

  registerAll(catalogId: string, components: Record<string, Component>, apis?: Record<string, ComponentApi>) {
    if (!this.catalogs.has(catalogId)) {
      this.catalogs.set(catalogId, new Map());
      this.apis.set(catalogId, new Map());
    }
    const catalog = this.catalogs.get(catalogId)!;
    for (const [type, component] of Object.entries(components)) {
      catalog.set(type, component);
    }

    if (apis) {
      const apiCatalog = this.apis.get(catalogId)!;
      for (const [type, api] of Object.entries(apis)) {
        apiCatalog.set(type, api);
      }
    }
  }

  get(catalogId: string, type: string): Component | undefined {
    return this.catalogs.get(catalogId)?.get(type);
  }

  getApi(catalogId: string, type: string): ComponentApi | undefined {
    return this.apis.get(catalogId)?.get(type);
  }

  has(catalogId: string, type: string): boolean {
    return this.catalogs.get(catalogId)?.has(type) ?? false;
  }

  keys(catalogId: string): string[] {
    const catalog = this.catalogs.get(catalogId);
    return catalog ? Array.from(catalog.keys()) : [];
  }
}

export const defaultRegistry = new ComponentRegistry();
