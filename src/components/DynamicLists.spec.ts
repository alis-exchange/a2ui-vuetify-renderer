import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UIRow from './A2UIRow.vue';
import A2UIColumn from './A2UIColumn.vue';
import A2UIList from './A2UIList.vue';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify();

function createMockContext(data: any = {}) {
  // We need a simple dataModel mock to pass to useA2UI
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: {
      model: {
        getSurface: () => ({
          dataModel: {
            get: (path: string) => {
              if (path === '/items') return data.items;
              return undefined;
            }
          }
        })
      }
    },
    dataContextPath: '/'
  };
}

describe('Dynamic Template Lists', () => {
  const stubs = {
    ComponentNode: {
      template: '<div class="child-node" :data-id="id" :data-path="path"></div>',
      props: ['id', 'path']
    }
  };

  const dynamicChildrenProp = { path: '/items', componentId: 'template-id' };
  const mockData = { items: [{ name: 'A' }, { name: 'B' }] };

  it('A2UIRow renders dynamic children', () => {
    const wrapper = mount(A2UIRow, {
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext(mockData) }, plugins: [vuetify], stubs },
      props: { node: { id: 'row1', type: 'Row', properties: { children: dynamicChildrenProp } } as any }
    });
    const children = wrapper.findAll('.child-node');
    expect(children.length).toBe(2);
    expect(children[0].attributes('data-path')).toBe('/items/0');
    expect(children[1].attributes('data-path')).toBe('/items/1');
  });

  it('A2UIColumn renders dynamic children', () => {
    const wrapper = mount(A2UIColumn, {
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext(mockData) }, plugins: [vuetify], stubs },
      props: { node: { id: 'col1', type: 'Column', properties: { children: dynamicChildrenProp } } as any }
    });
    const children = wrapper.findAll('.child-node');
    expect(children.length).toBe(2);
    expect(children[0].attributes('data-path')).toBe('/items/0');
    expect(children[1].attributes('data-path')).toBe('/items/1');
  });

  it('A2UIList renders dynamic children', () => {
    const wrapper = mount(A2UIList, {
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext(mockData) }, plugins: [vuetify], stubs },
      props: { node: { id: 'list1', type: 'List', properties: { children: dynamicChildrenProp } } as any }
    });
    const children = wrapper.findAll('.child-node');
    expect(children.length).toBe(2);
    expect(children[0].attributes('data-path')).toBe('/items/0');
    expect(children[1].attributes('data-path')).toBe('/items/1');
  });
});
