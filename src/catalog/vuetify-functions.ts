import { OpenUrlApi as OpenUrlApiV10, createBasicCatalogFunctions as createBasicCatalogFunctionsV10 } from '@a2ui/web_core/catalogs/basic/v1';
import { A2uiExpressionError, createFunctionImplementation, type FunctionImplementation } from '@a2ui/web_core/v0_9';
import { OpenUrlApi, createBasicCatalogFunctions } from '@a2ui/web_core/v0_9/basic_catalog';
import { A2UI_V09, A2UI_V10, type ProtocolKit } from '../protocol/kits';

/**
 * Options for {@link createVuetifyFunctions}.
 */
export interface VuetifyFunctionsOptions {
  /**
   * BCP 47 locale (e.g. `navigator.language`) used by `formatNumber`, `formatCurrency`
   * and `pluralize`. Defaults to the host runtime locale on v0.9 and to `en-US` on v1.0
   * (web_core's v1.0 functions do not read the host locale).
   */
  locale?: string;
  /**
   * Protocol family to build the functions for: {@link A2UI_V09} (default, v0.9 and v0.9.1)
   * or `A2UI_V10`. v1.0 validation functions return a `ValidationResult` instead of a boolean,
   * and v1.0 has only the specification's functions (no `add`, `equals`, ...).
   */
  protocol?: ProtocolKit;
}

/**
 * URL schemes `openUrl` may hand to the browser. `javascript:` and `data:` stay blocked
 * because an agent could otherwise run arbitrary script in the host page.
 */
const OPEN_URL_ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** The Vuetify `openUrl` body, shared by both protocol versions. */
function openUrl(rawUrl: string | undefined): void {
  if (!rawUrl || typeof window === 'undefined' || !window.open) return;

  const baseHref = window.location?.href || undefined;
  let url: URL;
  try {
    url = baseHref ? new URL(rawUrl, baseHref) : new URL(rawUrl);
  } catch (e) {
    throw new A2uiExpressionError(`Invalid URL specified: ${rawUrl}`, 'openUrl', e);
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
}

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
export const VuetifyOpenUrlImplementation: FunctionImplementation = createFunctionImplementation({ ...OpenUrlApi, allowedCallers: 'rendererOnly', requiresUserActivation: true }, (args) => openUrl(args.url));

/**
 * The v1.0 build of {@link VuetifyOpenUrlImplementation}: v1.0's `openUrl` schema, the same
 * behaviour. Keeping `mailto:` and `tel:` goes beyond the v1.0 spec (http(s) only) on purpose;
 * the click gate removes the risk that rule guards against.
 */
export const VuetifyOpenUrlImplementationV1: FunctionImplementation = createFunctionImplementation({ ...OpenUrlApiV10, allowedCallers: 'rendererOnly', requiresUserActivation: true }, (args: { url?: string }) => openUrl(args.url));

/**
 * Builds the Vuetify catalog's function implementations for one protocol family: web_core's
 * basic catalog functions (required, regex, formatString, ...) with `openUrl` swapped for the
 * Vuetify implementation.
 *
 * Pass a `locale` to get locale-aware `formatNumber`, `formatCurrency` and `pluralize`.
 * Function names, schemas and return types are identical to the basic catalog, so the
 * generated catalog JSON does not depend on the locale.
 *
 * @example
 * ```ts
 * const catalog = new Catalog(CATALOG_ID, '0.9', VUETIFY_COMPONENTS, createVuetifyFunctions({ locale: navigator.language }), VUETIFY_THEME_SCHEMA);
 * const catalogV1 = new Catalog(CATALOG_ID_V1, '1.0', VUETIFY_COMPONENTS_V1, createVuetifyFunctions({ locale: navigator.language, protocol: A2UI_V10 }));
 * ```
 */
export function createVuetifyFunctions(options?: VuetifyFunctionsOptions): FunctionImplementation[] {
  const v10 = (options?.protocol ?? A2UI_V09).version === 'v1.0';
  const locale = options?.locale === undefined ? undefined : { locale: options.locale };
  const base = v10 ? createBasicCatalogFunctionsV10(locale) : createBasicCatalogFunctions(locale);
  const replacement = v10 ? VuetifyOpenUrlImplementationV1 : VuetifyOpenUrlImplementation;
  // Replace by name rather than append: the catalog generator iterates this array and
  // would otherwise emit a duplicate openUrl entry.
  return base.map((fn) => (fn.name === OpenUrlApi.name ? replacement : fn));
}

/** Default Vuetify catalog functions for v0.9 (host runtime locale). Same as `createVuetifyFunctions()`. */
export const VUETIFY_FUNCTIONS: FunctionImplementation[] = createVuetifyFunctions();

/** Default Vuetify catalog functions for v1.0. Same as `createVuetifyFunctions({ protocol: A2UI_V10 })`. */
export const VUETIFY_FUNCTIONS_V1: FunctionImplementation[] = createVuetifyFunctions({ protocol: A2UI_V10 });
