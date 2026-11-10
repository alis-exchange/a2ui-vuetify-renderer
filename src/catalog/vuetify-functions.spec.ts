import { RpcHandler } from '@a2ui/web_core/rpc';
import { A2uiExpressionError, Catalog, type FunctionImplementation } from '@a2ui/web_core/v0_9';
import { BASIC_FUNCTIONS, OpenUrlApi, OpenUrlImplementation } from '@a2ui/web_core/v0_9/basic_catalog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { A2UI_V10 } from '../protocol/kits';
import { VUETIFY_FUNCTIONS, VuetifyOpenUrlImplementation, VuetifyOpenUrlImplementationV1, createVuetifyFunctions } from './vuetify-functions';

/** Runs a function through a real Catalog so zod parsing and defaults apply, like at runtime. */
function invoke(fns: FunctionImplementation[], name: string, args: Record<string, unknown>) {
  return new Catalog('test-catalog', [], fns).invoker(name, args, undefined as any);
}

describe('createVuetifyFunctions', () => {
  it('mirrors the basic catalog function set in order, without duplicates', () => {
    const names = createVuetifyFunctions().map((fn) => fn.name);
    expect(names).toEqual(BASIC_FUNCTIONS.map((fn) => fn.name));
    expect(new Set(names).size).toBe(names.length);
  });

  it('keeps every function API identical to the basic catalog so the generated catalog JSON does not change', () => {
    const fns = createVuetifyFunctions({ locale: 'de-DE' });
    fns.forEach((fn, i) => {
      expect(fn.name).toBe(BASIC_FUNCTIONS[i].name);
      expect(fn.schema).toBe(BASIC_FUNCTIONS[i].schema);
      expect(fn.returnType).toBe(BASIC_FUNCTIONS[i].returnType);
    });
  });

  it('replaces openUrl with the Vuetify implementation', () => {
    const openUrl = createVuetifyFunctions().find((fn) => fn.name === OpenUrlApi.name);
    expect(openUrl).toBe(VuetifyOpenUrlImplementation);
    expect(openUrl).not.toBe(OpenUrlImplementation);
    expect(VUETIFY_FUNCTIONS.find((fn) => fn.name === OpenUrlApi.name)).toBe(VuetifyOpenUrlImplementation);
  });

  it('applies the locale to formatNumber', () => {
    expect(invoke(createVuetifyFunctions({ locale: 'de-DE' }), 'formatNumber', { value: 1234.5 })).toBe('1.234,5');
    expect(invoke(createVuetifyFunctions({ locale: 'en-US' }), 'formatNumber', { value: 1234.5 })).toBe('1,234.5');
  });
});

describe('Vuetify openUrl', () => {
  const fns = createVuetifyFunctions();
  let open: ReturnType<typeof vi.fn>;
  let assign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    open = vi.fn();
    assign = vi.fn();
    vi.stubGlobal('open', open);
    vi.stubGlobal('location', { href: 'https://example.com/base/', assign });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens http(s) URLs in a new tab with noopener,noreferrer', () => {
    invoke(fns, 'openUrl', { url: 'https://example.com/docs' });
    expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');
    expect(assign).not.toHaveBeenCalled();
  });

  it('resolves relative URLs against the current location', () => {
    invoke(fns, 'openUrl', { url: 'docs' });
    expect(open).toHaveBeenCalledWith('https://example.com/base/docs', '_blank', 'noopener,noreferrer');
  });

  it.each(['mailto:hi@example.com', 'tel:+27110000000'])('hands %s to the current tab instead of a blank window', (url) => {
    invoke(fns, 'openUrl', { url });
    expect(assign).toHaveBeenCalledWith(url);
    expect(open).not.toHaveBeenCalled();
  });

  it.each(['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'blob:https://example.com/x'])('rejects %s with the upstream error', (url) => {
    let error: unknown;
    try {
      invoke(fns, 'openUrl', { url });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(A2uiExpressionError);
    expect((error as A2uiExpressionError).message).toMatch(/^Unsupported URL scheme: /);
    expect((error as A2uiExpressionError).expression).toBe('openUrl');
    expect(open).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it('rejects unparseable URLs with the upstream error', () => {
    expect(() => invoke(fns, 'openUrl', { url: 'http://' })).toThrow(/^Invalid URL specified: /);
  });

  it('rejects a missing url argument through the catalog schema', () => {
    expect(() => invoke(fns, 'openUrl', {})).toThrow(A2uiExpressionError);
  });

  it('is a no-op outside a browser', () => {
    vi.stubGlobal('window', undefined);
    expect(() => invoke(fns, 'openUrl', { url: 'https://example.com' })).not.toThrow();
    expect(open).not.toHaveBeenCalled();
  });
});

describe('agent-initiated calls (callRendererFunction)', () => {
  // RpcHandler reads allowedCallers off the runtime implementation, not the published JSON.
  const catalog = new Catalog('test-catalog', [], createVuetifyFunctions());
  const call = (name: string, args: Record<string, unknown>) =>
    new RpcHandler({ catalogs: [catalog] }).handleCallRendererFunction({
      version: 'v0.9',
      callRendererFunction: { functionCallId: 'fc-1', callFunction: { call: name, catalogId: 'test-catalog', args } },
    } as any);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['https://example.com/docs', 'mailto:hi@example.com', 'tel:+27110000000'])('refuses an agent call to openUrl(%s)', async (url) => {
    const open = vi.fn();
    const assign = vi.fn();
    vi.stubGlobal('open', open);
    vi.stubGlobal('location', { href: 'https://example.com/', assign });
    const response: any = await call('openUrl', { url });
    expect(JSON.stringify(response)).toMatch(/cannot be called by agent \(allowedCallers is rendererOnly\)/);
    expect(open).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it('keeps the pure helpers renderer-only', async () => {
    const response: any = await call('required', { value: 'x' });
    expect(JSON.stringify(response)).toMatch(/cannot be called by agent \(allowedCallers is rendererOnly\)/);
  });
});

describe('v1.0 functions', () => {
  const fnsV1 = createVuetifyFunctions({ protocol: A2UI_V10 });
  const invokeV1 = (name: string, args: Record<string, unknown>) => new Catalog('v1-test', '1.0', [], fnsV1).invoker(name, args, undefined as any);

  afterEach(() => vi.unstubAllGlobals());

  it('are the specification functions plus @index, with the Vuetify openUrl', () => {
    expect(fnsV1.map((fn) => fn.name)).not.toContain('add');
    expect(fnsV1.find((fn) => fn.name === 'openUrl')).toBe(VuetifyOpenUrlImplementationV1);
    expect(VuetifyOpenUrlImplementationV1.allowedCallers).toBe('rendererOnly');
    expect(VuetifyOpenUrlImplementationV1.requiresUserActivation).toBe(true);
  });

  it('return ValidationResults from validators', () => {
    expect(invokeV1('required', { value: '' })).toMatchObject({ valid: false });
    expect(invokeV1('required', { value: 'x' })).toMatchObject({ valid: true });
  });

  it('keep mailto: on v1.0, like v0.9', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { href: 'https://example.com/', assign });
    vi.stubGlobal('open', vi.fn());
    invokeV1('openUrl', { url: 'mailto:hi@example.com' });
    expect(assign).toHaveBeenCalledWith('mailto:hi@example.com');
  });
});
