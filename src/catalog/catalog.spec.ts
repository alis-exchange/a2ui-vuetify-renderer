import { A2uiValidationError, Catalog, MessageProcessor, scrapeSchemaBehavior, type A2uiMessage } from '@a2ui/web_core/v0_9';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG_ID } from '../core/constants';
import { VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA } from './index';

/**
 * Pins down how @a2ui/web_core (>= 0.10.6) treats the Vuetify catalog: every component in an
 * `updateComponents` message is validated against its strict zod schema before any state
 * changes, and one bad component rejects the whole message.
 */
describe('Vuetify catalog under MessageProcessor validation', () => {
  const SURFACE = 's1';
  let processor: MessageProcessor;

  const createSurface: A2uiMessage = { version: 'v0.9', createSurface: { surfaceId: SURFACE, catalogId: CATALOG_ID } };
  const update = (components: Record<string, unknown>[]): A2uiMessage => ({ version: 'v0.9', updateComponents: { surfaceId: SURFACE, components } }) as A2uiMessage;
  const rootColumn = { id: 'root', component: 'Column', children: ['tf'] };
  const validButton = { id: 'btn', component: 'Button', label: 'Go', action: { event: { name: 'go' } } };

  beforeEach(() => {
    const catalog = new Catalog(CATALOG_ID, VUETIFY_COMPONENTS, VUETIFY_FUNCTIONS, VUETIFY_THEME_SCHEMA);
    processor = new MessageProcessor([catalog], undefined, { version: 'v0.9' });
    // The processor logs every validation failure before throwing; keep test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts spec-compliant components, including protocol-shaped checks', () => {
    const textField = {
      id: 'tf',
      component: 'TextField',
      label: 'Name',
      value: { path: '/name' },
      checks: [{ condition: { call: 'required', args: { value: { path: '/name' } } }, message: 'Name is required' }],
    };

    expect(() => processor.processMessages([createSurface, update([rootColumn, textField])])).not.toThrow();

    const stored = processor.model.getSurface(SURFACE)?.componentsModel.get('tf');
    expect(stored?.type).toBe('TextField');
    expect(stored?.properties.checks).toHaveLength(1);
  });

  it('rejects unknown properties because the Vuetify schemas are strict', () => {
    processor.processMessages([createSurface]);

    let error: unknown;
    try {
      processor.processMessages([update([{ ...validButton, foo: 'bar' }])]);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(A2uiValidationError);
    expect((error as A2uiValidationError).code).toBe('VALIDATION_ERROR');
    expect((error as A2uiValidationError).message).toContain("Validation failed for component 'Button' (btn)");
    expect((error as A2uiValidationError).message).toContain('foo');
    expect(Array.isArray((error as A2uiValidationError).details)).toBe(true);
  });

  it('keeps every component schema readable by the binder', () => {
    // A ZodEffects root (refine/transform) hides the shape from GenericBinder, which then treats
    // every prop as static: no action closures, no isValid. Guard against that regressing.
    for (const api of VUETIFY_COMPONENTS) {
      expect(scrapeSchemaBehavior(api.schema).type, api.name).toBe('OBJECT');
    }
  });

  it('rejects legacy ad-hoc check shapes', () => {
    processor.processMessages([createSurface]);
    expect(() => processor.processMessages([update([{ id: 'tf', component: 'TextField', label: 'Name', checks: [{ type: 'required' }] }])])).toThrow(A2uiValidationError);
  });

  it('rejects the whole message when one component is invalid', () => {
    processor.processMessages([createSurface]);
    expect(() => processor.processMessages([update([rootColumn, { ...validButton, foo: 'bar' }])])).toThrow(A2uiValidationError);
    expect(processor.model.getSurface(SURFACE)?.componentsModel.get('root')).toBeUndefined();
  });

  it('advertises the Vuetify catalog id in client capabilities', () => {
    const capabilities = processor.getClientCapabilities();
    expect(capabilities['v0.9']?.supportedCatalogIds).toEqual([CATALOG_ID]);
  });
});
