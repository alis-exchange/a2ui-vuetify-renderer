import { isAtLeastVersion } from '@a2ui/web_core/semver';

/**
 * Whether a surface speaks A2UI v1.0 or later. Reads the surface's own version, which web_core
 * sets even when a v1.0 surface has no default catalog, and falls back to the default catalog's.
 */
export function isV10Surface(surface: { protocolVersion?: string; defaultCatalog?: { protocolVersion?: string } } | undefined): boolean {
  return isAtLeastVersion(surface?.protocolVersion ?? surface?.defaultCatalog?.protocolVersion, '1.0');
}
