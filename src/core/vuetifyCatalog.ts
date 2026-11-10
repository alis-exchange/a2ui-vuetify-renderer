import baseCatalog from '../../catalog/vuetify-catalog.json';
import baseCatalogV1 from '../../catalog/vuetify-catalog.v1.json';

/**
 * The generated Vuetify catalog document, exactly as published at the catalog's own `$id`.
 *
 * The bundler inlines this JSON, so reading it costs nothing beyond what the package already
 * carries. Use it when you want the document itself — feeding an agent library, emitting it from
 * a build step, or inspecting the declared components and functions. Use
 * {@link getCatalogSchema} instead when you need components registered at runtime merged in.
 *
 * This is the module's shared instance: treat it as read-only. `getCatalogSchema` deep-clones
 * before modifying, and callers that intend to edit the document should do the same.
 *
 * Outside a bundler, the same file is available at the `./catalog` subpath:
 * `require('@alis-build/a2ui-vuetify-renderer/catalog')`.
 *
 * @example
 * ```ts
 * import { VUETIFY_CATALOG } from '@alis-build/a2ui-vuetify-renderer'
 *
 * Object.keys(VUETIFY_CATALOG.components) // every component the catalog declares
 * VUETIFY_CATALOG.functions.openUrl.requiresUserActivation // true
 * ```
 */
export const VUETIFY_CATALOG: Readonly<Record<string, any>> = baseCatalog;

/**
 * The generated A2UI v1.0 Vuetify catalog document, the counterpart of {@link VUETIFY_CATALOG}
 * for `CATALOG_ID_V1`. Written by web_core's `Catalog.toJson()`, so it references
 * `common_types.json` rather than inlining every type.
 *
 * Treat it as read-only. Outside a bundler: `require('@alis-build/a2ui-vuetify-renderer/catalog/v1')`.
 */
export const VUETIFY_CATALOG_V1: Readonly<Record<string, any>> = baseCatalogV1;
