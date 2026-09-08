import { isComponentNode, type ComponentNode, type NodeProps } from '@a2ui/web_core/v0_9';

/**
 * Finds the live child node a container is asking for by component id.
 *
 * In node mode a parent's resolved props already hold its children as live
 * `ComponentNode`s: a single reference (`child`, `trigger`), a `ChildList`
 * (array of nodes, one per template item), or an array of plain objects that
 * carry a reference (`items[].child`). Containers keep passing ids, so this
 * bridges the id back to the node. `path` disambiguates template items, which
 * share a component id and differ only by data scope.
 */
export function findLiveNode(nodeProps: NodeProps | undefined, id: string, path?: string): ComponentNode | undefined {
  if (!nodeProps) return undefined;

  const matches = (node: ComponentNode) => node.componentId === id && (path === undefined || node.dataPath === path);

  for (const value of Object.values(nodeProps)) {
    if (isComponentNode(value)) {
      if (matches(value)) return value;
      continue;
    }
    if (!Array.isArray(value)) continue;
    for (const entry of value) {
      if (isComponentNode(entry)) {
        if (matches(entry)) return entry;
      } else if (entry && typeof entry === 'object') {
        for (const nested of Object.values(entry as Record<string, unknown>)) {
          if (isComponentNode(nested) && matches(nested)) return nested;
        }
      }
    }
  }
  return undefined;
}
