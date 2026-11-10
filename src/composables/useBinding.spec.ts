import { DataModel, ResolvedBinding, WritableBinding } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, shallowRef } from 'vue';
import { A2UI_CONTEXT_KEY } from './useA2UI';
import { useBinding } from './useBinding';

function bind(properties: Record<string, unknown>, nodeProps?: Record<string, unknown>, data: Record<string, unknown> = {}) {
  const dataModel = new DataModel(data);
  let binding!: ReturnType<typeof useBinding<unknown>>;
  const Probe = defineComponent({
    setup() {
      binding = useBinding<unknown>(() => ({ id: 'n', type: 'TextField', properties }) as any, 'value');
      return () => h('div');
    },
  });
  mount(Probe, {
    global: {
      provide: {
        [A2UI_CONTEXT_KEY as symbol]: {
          surfaceId: 's',
          onAction: vi.fn(),
          processor: { model: { getSurface: () => ({ id: 's', dataModel, defaultCatalog: { invoker: () => undefined } }) } },
          dataContextPath: '/',
          nodeProps: nodeProps === undefined ? undefined : shallowRef(nodeProps),
        },
      },
    },
  });
  return { binding, dataModel };
}

describe('useBinding', () => {
  it('writes through the WritableBinding web_core put in the node props', () => {
    const set = vi.fn();
    const { binding, dataModel } = bind({ value: { path: '/name' } }, { value: new WritableBinding('Ada', set, '/name') }, { name: 'Ada' });
    binding.value = 'Grace';
    expect(set).toHaveBeenCalledWith('Grace');
    // The binding owns the write; the raw path is not written a second time.
    expect(dataModel.get('/name')).toBe('Ada');
  });

  it('writes nothing for a read-only binding (a literal or a function call)', () => {
    const { binding, dataModel } = bind({ value: { path: '/name' } }, { value: new ResolvedBinding('Ada') }, { name: 'Ada' });
    binding.value = 'Grace';
    expect(dataModel.get('/name')).toBe('Ada');
  });

  it('writes the raw binding path on the legacy render path', () => {
    const { binding, dataModel } = bind({ value: { path: '/name' } }, undefined, { name: 'Ada' });
    binding.value = 'Grace';
    expect(dataModel.get('/name')).toBe('Grace');
  });
});
