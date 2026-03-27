import type { Component, InjectionKey } from 'vue';

export const A2UI_REGISTRY_KEY: InjectionKey<ComponentRegistry> = Symbol('A2UI_REGISTRY_KEY');

export class ComponentRegistry {
  private catalogs: Map<string, Map<string, Component>> = new Map();

  register(catalogId: string, type: string, component: Component) {
    if (!this.catalogs.has(catalogId)) {
      this.catalogs.set(catalogId, new Map());
    }
    this.catalogs.get(catalogId)!.set(type, component);
  }

  registerAll(catalogId: string, components: Record<string, Component>) {
    if (!this.catalogs.has(catalogId)) {
      this.catalogs.set(catalogId, new Map());
    }
    const catalog = this.catalogs.get(catalogId)!;
    for (const [type, component] of Object.entries(components)) {
      catalog.set(type, component);
    }
  }

  get(catalogId: string, type: string): Component | undefined {
    return this.catalogs.get(catalogId)?.get(type);
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

