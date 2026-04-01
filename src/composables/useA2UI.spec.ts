import { DataModel } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, provide } from 'vue';
import { A2UI_CONTEXT_KEY, useA2UI } from './useA2UI';

describe('useA2UI composable', () => {
  it('throws an error if injected outside of A2UIProvider', () => {
    const TestComponent = defineComponent({
      setup() {
        useA2UI();
        return {};
      },
      template: '<div></div>',
    });

    expect(() => mount(TestComponent)).toThrow('useA2UI must be used within an A2UIProvider');
  });

  it('injects correctly and provides resolution helpers', () => {
    const dataModel = new DataModel({
      test: {
        string: 'resolved-string',
        bool: true,
        num: 42,
      },
    });

    const mockContext = {
      surfaceId: 'test-surface',
      onAction: vi.fn(),
      processor: {
        model: {
          getSurface: vi.fn().mockReturnValue({
            id: 'test-surface',
            dataModel: dataModel,
            catalog: { invoker: () => undefined },
          }),
        },
      },
      dataContextPath: '/test',
    };

    let injectedData: any = null;

    const TestComponent = defineComponent({
      setup() {
        injectedData = useA2UI();
        return {};
      },
      template: '<div></div>',
    });

    const ProviderComponent = defineComponent({
      components: { TestComponent },
      setup() {
        provide(A2UI_CONTEXT_KEY, mockContext);
        return {};
      },
      template: '<TestComponent />',
    });

    mount(ProviderComponent);

    expect(injectedData).toBeTruthy();
    expect(injectedData.surfaceId).toBe('test-surface');
    expect(injectedData.dataContextPath).toBe('/test');

    expect(injectedData.resolveValue({ path: '/test/string' })).toBe('resolved-string');
    expect(injectedData.resolveValue({ path: '/test/bool' })).toBe(true);
    expect(injectedData.resolveValue({ path: '/test/num' })).toBe(42);

    injectedData.sendAction('my-action', 'test-component', { some: { path: '/test/string' } });
    expect(mockContext.onAction).toHaveBeenCalledWith({
      name: 'my-action',
      sourceComponentId: 'test-component',
      surfaceId: 'test-surface',
      timestamp: expect.any(String),
      context: { some: 'resolved-string' },
    });

    mockContext.onAction.mockClear();
    injectedData.sendAction('no-context-action', 'test-component');
    expect(mockContext.onAction).toHaveBeenCalledWith({
      name: 'no-context-action',
      sourceComponentId: 'test-component',
      surfaceId: 'test-surface',
      timestamp: expect.any(String),
      context: {},
    });
  });
});
