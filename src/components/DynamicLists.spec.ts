import { DataModel } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIColumn from './A2UIColumn.vue';
import A2UIList from './A2UIList.vue';
import A2UIRow from './A2UIRow.vue';

const vuetify = createVuetify();

function createMockContext(data: any = {}) {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: {
      model: {
        getSurface: () => ({
          id: 'test-surface',
          dataModel: new DataModel(data),
          defaultCatalog: { invoker: () => undefined },
        }),
      },
    },
    dataContextPath: '/',
  };
}

describe('Dynamic Template Lists', () => {
  const stubs = {
    ComponentNode: {
      template: '<div class="child-node" :data-id="id" :data-path="path"></div>',
      props: ['id', 'path'],
    },
  };

  const dynamicChildrenProp = { path: '/items', componentId: 'template-id' };
  const mockData = { items: [{ name: 'A' }, { name: 'B' }] };

  it('A2UIRow renders dynamic children', () => {
    const wrapper = mount(A2UIRow, {
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext(mockData) }, plugins: [vuetify], stubs },
      props: { node: { id: 'row1', type: 'Row', properties: { children: dynamicChildrenProp } } as any },
    });
    const children = wrapper.findAll('.child-node');
    expect(children.length).toBe(2);
    expect(children[0].attributes('data-path')).toBe('/items/0');
    expect(children[1].attributes('data-path')).toBe('/items/1');
  });

  it('A2UIColumn renders dynamic children', () => {
    const wrapper = mount(A2UIColumn, {
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext(mockData) }, plugins: [vuetify], stubs },
      props: { node: { id: 'col1', type: 'Column', properties: { children: dynamicChildrenProp } } as any },
    });
    const children = wrapper.findAll('.child-node');
    expect(children.length).toBe(2);
    expect(children[0].attributes('data-path')).toBe('/items/0');
    expect(children[1].attributes('data-path')).toBe('/items/1');
  });

  it('A2UIList renders dynamic children', () => {
    const wrapper = mount(A2UIList, {
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext(mockData) }, plugins: [vuetify], stubs },
      props: { node: { id: 'list1', type: 'List', properties: { children: dynamicChildrenProp } } as any },
    });
    const children = wrapper.findAll('.child-node');
    expect(children.length).toBe(2);
    expect(children[0].attributes('data-path')).toBe('/items/0');
    expect(children[1].attributes('data-path')).toBe('/items/1');
  });

  it.each([
    [{}, ['flex-column', 'align-stretch'], ['flex-row']],
    [{ direction: 'horizontal' }, ['flex-row', 'overflow-x-auto', 'align-stretch'], ['flex-column']],
    [{ direction: 'vertical', align: 'center' }, ['flex-column', 'align-center'], ['align-stretch']],
    [{ direction: 'horizontal', align: 'end' }, ['flex-row', 'align-end'], ['flex-column']],
  ])('A2UIList lays children out for %j', (layout, present, absent) => {
    const wrapper = mount(A2UIList, {
      global: { provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext(mockData) }, plugins: [vuetify], stubs },
      props: { node: { id: 'list1', type: 'List', properties: { children: dynamicChildrenProp, ...layout } } as any },
    });
    const classes = wrapper.findComponent({ name: 'VList' }).classes();
    for (const name of present) expect(classes).toContain(name);
    for (const name of absent) expect(classes).not.toContain(name);
  });
});
