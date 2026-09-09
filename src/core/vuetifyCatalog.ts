import baseCatalog from '../../catalog/vuetify-catalog.json';

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
 * VUETIFY_CATALOG.functions.openUrl.allowedCallers // 'rendererOrAgent'
 * ```
 */
export const VUETIFY_CATALOG: Readonly<Record<string, any>> = baseCatalog;
