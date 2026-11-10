import { A2uiExpressionError, createFunctionImplementation, type FunctionImplementation } from '@a2ui/web_core/v0_9';
import { OpenUrlApi, createBasicCatalogFunctions } from '@a2ui/web_core/v0_9/basic_catalog';

/**
 * Options for {@link createVuetifyFunctions}.
 */
export interface VuetifyFunctionsOptions {
  /**
   * BCP 47 locale (e.g. `navigator.language`) used by `formatNumber`, `formatCurrency`
   * and `pluralize`. Defaults to the host runtime locale.
   */
  locale?: string;
}

/**
 * URL schemes `openUrl` may hand to the browser. `javascript:` and `data:` stay blocked
 * because an agent could otherwise run arbitrary script in the host page.
 */
const OPEN_URL_ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * `openUrl` for the Vuetify catalog.
 *
 * Same name, schema and return type as the basic catalog's `openUrl` (so the generated
 * catalog JSON is unchanged), but `mailto:` and `tel:` links keep working: web_core >= 0.10.2
 * only allows http(s). Errors mirror the upstream messages.
 *
 * Renderer-only and gated on a user click, as A2UI v1.0 requires of `openUrl`: an agent cannot
 * call it (`RpcHandler` refuses), and web_core's invoker refuses it in a passive binding or a
 * check, so it runs only from an action the user triggered. Without the gate a `mailto:` or
 * `tel:` link, which goes through `location.assign` rather than the popup blocker, would start
 * a mail app or a call with no click. The catalog generator reads both flags from here.
 */
export const VuetifyOpenUrlImplementation: FunctionImplementation = createFunctionImplementation({ ...OpenUrlApi, allowedCallers: 'rendererOnly', requiresUserActivation: true }, (args) => {
  if (!args.url || typeof window === 'undefined' || !window.open) return;

  const baseHref = window.location?.href || undefined;
  let url: URL;
  try {
    url = baseHref ? new URL(args.url, baseHref) : new URL(args.url);
  } catch (e) {
    throw new A2uiExpressionError(`Invalid URL specified: ${args.url}`, 'openUrl', e);
  }

  if (!OPEN_URL_ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new A2uiExpressionError(`Unsupported URL scheme: ${url.protocol}`, 'openUrl');
  }

  if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
    // A _blank window would be left empty once the mail/phone handler takes over.
    window.location.assign(url.href);
    return;
  }

  window.open(url.href, '_blank', 'noopener,noreferrer');
});

/**
 * Builds the Vuetify catalog's function implementations: the basic catalog functions
 * (required, regex, formatString, ...) with `openUrl` swapped for
 * {@link VuetifyOpenUrlImplementation}.
 *
 * Pass a `locale` to get locale-aware `formatNumber`, `formatCurrency` and `pluralize`.
 * Function names, schemas and return types are identical to the basic catalog, so the
 * generated catalog JSON does not depend on the options.
 *
 * @example
 * ```ts
 * const catalog = new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, createVuetifyFunctions({ locale: navigator.language }), VUETIFY_THEME_SCHEMA);
 * ```
 */
export function createVuetifyFunctions(options?: VuetifyFunctionsOptions): FunctionImplementation[] {
  // Replace by name rather than append: the catalog generator iterates this array and
  // would otherwise emit a duplicate openUrl entry.
  return createBasicCatalogFunctions(options).map((fn) => (fn.name === OpenUrlApi.name ? VuetifyOpenUrlImplementation : fn));
}

/** Default Vuetify catalog functions (host runtime locale). Same as `createVuetifyFunctions()`. */
export const VUETIFY_FUNCTIONS: FunctionImplementation[] = createVuetifyFunctions();
