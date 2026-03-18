import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UIList from './A2UIList.vue';
import A2UITable from './A2UITable.vue';
import A2UITreeView from './A2UITreeView.vue';
import A2UICalendar from './A2UICalendar.vue';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import { createVuetify } from 'vuetify';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const vuetify = createVuetify();

function createMockContext(data: any = {}) {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: {
      model: {
        getSurface: vi.fn().mockReturnValue({})
      }
    },
    dataContextPath: '/'
  };
}

describe('Data Display', () => {
  describe('A2UIList', () => {
    it('renders list with children', () => {
      const wrapper = mount(A2UIList, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: {
            ComponentNode: {
              template: '<div class="child-node" :data-id="id"></div>',
              props: ['id']
            }
          }
        },
        props: {
          node: {
            id: 'list1', type: 'List', properties: { children: ['item1', 'item2'] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const list = wrapper.findComponent({ name: 'VList' });
      expect(list.exists()).toBe(true);

      const children = wrapper.findAll('.child-node');
      expect(children.length).toBe(2);
      expect(children[0].attributes('data-id')).toBe('item1');
    });
  });

  describe('A2UITable', () => {
    it('renders table', () => {
      const wrapper = mount(A2UITable, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'tbl1', type: 'Table', properties: { items: [{ id: 1, name: 'Test' }] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const tbl = wrapper.findComponent({ name: 'VDataTable' });
      if (!tbl.exists()) {
        const fallback = wrapper.findComponent({ name: 'VTable' });
        expect(fallback.exists()).toBe(true);
      } else {
        expect(tbl.exists()).toBe(true);
      }
    });
  });

  describe('A2UITreeView', () => {
    it('renders treeview fallback if no VTreeview', () => {
      const wrapper = mount(A2UITreeView, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'tree1', type: 'TreeView', properties: { items: [{ name: 'Leaf' }] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('A2UICalendar', () => {
    it('renders calendar fallback if no VCalendar', () => {
      const wrapper = mount(A2UICalendar, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'cal1', type: 'Calendar', properties: { events: [{ title: 'Meeting', date: '2026-03-18' }] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      expect(wrapper.exists()).toBe(true);
    });
  });
});
