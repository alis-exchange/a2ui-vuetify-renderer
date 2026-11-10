import { isAtLeastVersion } from '@a2ui/web_core/semver';

/**
 * Whether a surface speaks A2UI v1.0 or later. Reads the surface's own version, which web_core
 * sets even when a v1.0 surface has no default catalog, and falls back to the default catalog's.
 */
export function isV10Surface(surface: { protocolVersion?: string; defaultCatalog?: { protocolVersion?: string } } | undefined): boolean {
  return isAtLeastVersion(surface?.protocolVersion ?? surface?.defaultCatalog?.protocolVersion, '1.0');
}

/** Anything that knows its protocol version, such as a web_core `DataContext`. */
type VersionAware = { readonly atLeastV10?: boolean } | undefined;

/**
 * A data binding for `path` in the surface's own syntax: `{ "@path" }` on v1.0, `{ path }` before.
 * A bare `{ path }` on a v1.0 surface is a literal object, not a binding.
 */
export function pathBinding(path: string, context: VersionAware): { path: string } | { '@path': string } {
  return context?.atLeastV10 ? { '@path': path } : { path };
}

/** The data path a raw binding names in the surface's own syntax, or `undefined` if it is not one. */
export function bindingPath(raw: unknown, context: VersionAware): string | undefined {
  if (raw === null || typeof raw !== 'object') return undefined;
  const path = (raw as Record<string, unknown>)[context?.atLeastV10 ? '@path' : 'path'];
  return typeof path === 'string' ? path : undefined;
}
