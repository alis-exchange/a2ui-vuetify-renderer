import type { Component, InjectionKey } from 'vue';

export const A2UI_REGISTRY_KEY: InjectionKey<ComponentRegistry> = Symbol('A2UI_REGISTRY_KEY');

export class ComponentRegistry {
  private components: Map<string, Component> = new Map();

  register(type: string, component: Component) {
    this.components.set(type, component);
  }

  registerAll(components: Record<string, Component>) {
    for (const [type, component] of Object.entries(components)) {
      this.components.set(type, component);
    }
  }

  get(type: string): Component | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }
}

export const defaultRegistry = new ComponentRegistry();
