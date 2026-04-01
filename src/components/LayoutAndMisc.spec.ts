import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIAvatar from './A2UIAvatar.vue';
import A2UIChip from './A2UIChip.vue';
import A2UIExpansionPanel from './A2UIExpansionPanel.vue';

const vuetify = createVuetify();

function createMockContext() {
  return {
    surfaceId: 'test-surface',
    onAction: vi.fn(),
    processor: {
      model: {
        getSurface: vi.fn().mockReturnValue({}),
      },
    },
    dataContextPath: '/',
  };
}

describe('Layout and Misc Components', () => {
  describe('A2UIExpansionPanel', () => {
    it('renders expansion panels', () => {
      const wrapper = mount(A2UIExpansionPanel, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: { template: '<div class="child">child</div>' } },
        },
        props: {
          node: {
            id: 'ep1',
            type: 'ExpansionPanel',
            properties: { title: 'More Info', child: 'content1' },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const panel = wrapper.findComponent({ name: 'VExpansionPanels' });
      expect(panel.exists()).toBe(true);
      const inner = wrapper.findComponent({ name: 'VExpansionPanel' });
      expect(inner.exists()).toBe(true);
      expect(inner.props('title')).toBe('More Info');
    });

    it('renders object child', () => {
      const wrapper = mount(A2UIExpansionPanel, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: true },
        },
        props: {
          node: {
            id: 'ep2',
            type: 'ExpansionPanel',
            properties: { child: { id: 'objChild' } },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('A2UIChip', () => {
    it('renders chip', () => {
      const wrapper = mount(A2UIChip, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: { template: '<div class="child">Child</div>' } },
        },
        props: {
          node: {
            id: 'chip1',
            type: 'Chip',
            properties: { text: 'Active' },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const chip = wrapper.findComponent({ name: 'VChip' });
      expect(chip.exists()).toBe(true);
      expect(chip.text()).toContain('Active');
    });
  });

  describe('A2UIAvatar', () => {
    it('renders avatar', () => {
      const wrapper = mount(A2UIAvatar, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: true },
        },
        props: {
          node: {
            id: 'ava1',
            type: 'Avatar',
            properties: { image: 'url', child: { id: 'iconChild' } },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const ava = wrapper.findComponent({ name: 'VAvatar' });
      expect(ava.exists()).toBe(true);
      expect(ava.props('image')).toBe('url');
    });
  });
});
