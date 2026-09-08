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

  it('dispatchNodeAction invokes catalog invoker for functionCall actions', () => {
    const invoker = vi.fn();
    const dataModel = new DataModel({});

    const mockContext = {
      surfaceId: 'test-surface',
      onAction: vi.fn(),
      processor: {
        model: {
          getSurface: vi.fn().mockReturnValue({
            id: 'test-surface',
            dataModel,
            catalog: { invoker },
          }),
        },
      },
      dataContextPath: '/',
    };

    let injected: ReturnType<typeof useA2UI> | null = null;

    const TestComponent = defineComponent({
      setup() {
        injected = useA2UI();
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

    injected!.dispatchNodeAction({
      id: 'node-1',
      properties: {
        action: {
          functionCall: {
            call: 'openUrl',
            args: { url: 'https://example.com' },
          },
        },
      },
    } as any);

    expect(invoker).toHaveBeenCalledTimes(1);
    expect(invoker).toHaveBeenCalledWith('openUrl', { url: 'https://example.com' }, expect.objectContaining({ path: '/' }), expect.any(AbortSignal));
    expect(mockContext.onAction).not.toHaveBeenCalled();
  });
});

describe('useA2UI in node mode', () => {
  it('re-evaluates computeds built on resolveValue when the node props change', async () => {
    const { DataModel } = await import('@a2ui/web_core/v0_9');
    const { computed, defineComponent, nextTick, provide, shallowRef } = await import('vue');
    const dataModel = new DataModel({ name: 'Ada' });
    const nodeProps = shallowRef<Record<string, unknown> | undefined>({});
    const mockContext = {
      surfaceId: 'test-surface',
      onAction: vi.fn(),
      processor: { model: { getSurface: () => ({ id: 'test-surface', dataModel, catalog: { invoker: () => undefined } }) } },
      nodeProps,
    };
    let seen: string | undefined;
    const TestComponent = defineComponent({
      setup() {
        const { resolveValue } = useA2UI();
        const name = computed(() => resolveValue<string>({ path: '/name' }));
        return () => {
          seen = name.value;
          return null;
        };
      },
    });
    mount(defineComponent({
      components: { TestComponent },
      setup() {
        provide(A2UI_CONTEXT_KEY, mockContext);
        return {};
      },
      template: '<TestComponent />',
    }));
    expect(seen).toBe('Ada');

    // Simulate web_core reporting a change for this node after a local write.
    dataModel.set('/name', 'Grace');
    nodeProps.value = { changed: true };
    await nextTick();
    expect(seen).toBe('Grace');
  });
});
