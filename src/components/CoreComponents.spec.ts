import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UIText from './A2UIText.vue';
import A2UIImage from './A2UIImage.vue';
import A2UIIcon from './A2UIIcon.vue';
import A2UIDivider from './A2UIDivider.vue';
import A2UIRow from './A2UIRow.vue';
import A2UIColumn from './A2UIColumn.vue';
import A2UICard from './A2UICard.vue';
import A2UIButton from './A2UIButton.vue';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import { createVuetify } from 'vuetify';
import { DataModel } from '@a2ui/web_core/v0_9';

const vuetify = createVuetify();

function createMockContext(data: any = {}) {
  const dataModel = new DataModel(data);
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: {
      model: {
        getSurface: vi.fn().mockReturnValue({
          id: 'test-surface',
          dataModel: dataModel,
          catalog: { invoker: () => undefined }
        })
      }
    },
    dataContextPath: '/'
  };
}

describe('Core Content Components', () => {
  describe('A2UIText', () => {
    it('renders text and applies typography variant', () => {
      const wrapper = mount(A2UIText, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'text1', type: 'Text', properties: { text: 'Hello A2UI', variant: 'h2' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      expect(wrapper.text()).toBe('Hello A2UI');
      expect(wrapper.classes()).toContain('text-h2');
    });
  });

  describe('A2UIImage', () => {
    it('renders an image with correct url and cover', () => {
      const wrapper = mount(A2UIImage, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'img1', type: 'Image', properties: { url: 'https://example.com/img.png', fit: 'cover' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const img = wrapper.findComponent({ name: 'VImg' });
      expect(img.exists()).toBe(true);
      expect(img.props('src')).toBe('https://example.com/img.png');
      expect(img.props('cover')).toBe(true);
    });
  });

  describe('A2UIIcon', () => {
    it('renders an icon and maps names to mdi', () => {
      const wrapper = mount(A2UIIcon, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'icon1', type: 'Icon', properties: { name: 'home' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const icon = wrapper.findComponent({ name: 'VIcon' });
      expect(icon.exists()).toBe(true);
      expect(icon.props('icon')).toBe('mdi-home');
    });
  });

  describe('A2UIDivider', () => {
    it('renders a vertical divider', () => {
      const wrapper = mount(A2UIDivider, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'div1', type: 'Divider', properties: { axis: 'vertical' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const divider = wrapper.findComponent({ name: 'VDivider' });
      expect(divider.exists()).toBe(true);
      expect(divider.props('vertical')).toBe(true);
    });
  });

  describe('A2UIRow', () => {
    it('renders a row with children', () => {
      const wrapper = mount(A2UIRow, {
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
            id: 'row1', type: 'Row', properties: { children: ['child1', 'child2'], justify: 'center', align: 'center' }
          } as any
        }
      });
      expect(wrapper.classes()).toContain('flex-row');
      expect(wrapper.classes()).toContain('justify-center');
      expect(wrapper.classes()).toContain('align-center');
      const children = wrapper.findAll('.child-node');
      expect(children.length).toBe(2);
      expect(children[0].attributes('data-id')).toBe('child1');
    });
  });

  describe('A2UIColumn', () => {
    it('renders a column with children', () => {
      const wrapper = mount(A2UIColumn, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: true }
        },
        props: {
          node: {
            id: 'col1', type: 'Column', properties: { children: ['child1'] }
          } as any
        }
      });
      expect(wrapper.classes()).toContain('flex-column');
    });
  });

  describe('A2UICard', () => {
    it('renders a card with a child', () => {
      const wrapper = mount(A2UICard, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: true }
        },
        props: {
          node: { id: 'card1', type: 'Card', properties: { child: 'child1' } } as any
        }
      });
      const card = wrapper.findComponent({ name: 'VCard' });
      expect(card.exists()).toBe(true);
    });
  });

  describe('A2UIButton', () => {
    it('renders a button and maps variants', () => {
      const wrapper = mount(A2UIButton, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: true }
        },
        props: {
          node: {
            id: 'btn1', type: 'Button', properties: { variant: 'primary', child: 'child1' }
          } as any
        }
      });
      const btn = wrapper.findComponent({ name: 'VBtn' });
      expect(btn.exists()).toBe(true);
      expect(btn.props('color')).toBe('primary');
      expect(btn.props('variant')).toBe('elevated');
    });

    it('triggers sendAction on click', async () => {
      const mockContext = createMockContext();
      const wrapper = mount(A2UIButton, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify],
          stubs: { ComponentNode: true }
        },
        props: {
          node: {
            id: 'btn2', type: 'Button', properties: { action: { event: { name: 'submit' } } }
          } as any
        }
      });
      
      await wrapper.trigger('click');
      expect(mockContext.onAction).toHaveBeenCalledWith(expect.objectContaining({
        name: 'submit',
        sourceComponentId: 'btn2',
        surfaceId: 'test-surface',
        timestamp: expect.any(String),
        context: {}
      }));
    });
  });
});
