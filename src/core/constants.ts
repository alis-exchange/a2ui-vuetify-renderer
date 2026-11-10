/**
 * The canonical catalog identifier for the built-in Vuetify component set.
 *
 * Used as the key when registering and looking up components in the
 * {@link ComponentRegistry}. Custom components should be registered under
 * this same ID to appear alongside the built-in ones.
 */
export const CATALOG_ID = 'https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json';

/**
 * Catalog identifier of the A2UI v1.0 build of the same Vuetify component set.
 *
 * Resolves to the same Vue components as {@link CATALOG_ID}; only the component schemas differ
 * (v1.0 bindings are `{ "@path" }` / `{ "@call" }`). Like `CATALOG_ID`, it names the file on
 * `main`; use `VUETIFY_CATALOG_V1` or the `./catalog/v1` subpath for the installed version.
 */
export const CATALOG_ID_V1 = 'https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.v1.json';
