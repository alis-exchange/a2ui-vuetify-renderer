import { describe, it, expect, vi } from 'vitest';
import { useA2UI, A2UI_CONTEXT_KEY } from './useA2UI';
import { provide } from 'vue';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { DataModel } from '@a2ui/web_core/v0_9';

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
        num: 42
      }
    });

    const mockContext = {
      surfaceId: 'test-surface',
      onAction: vi.fn(),
      processor: {
        model: {
          getSurface: vi.fn().mockReturnValue({
            dataModel: dataModel
          })
        }
      },
      dataContextPath: '/test'
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
    
    injectedData.sendAction('my-action', { some: 'data' });
    expect(mockContext.onAction).toHaveBeenCalledWith({
      name: 'my-action',
      context: { some: 'data' }
    });
  });
});