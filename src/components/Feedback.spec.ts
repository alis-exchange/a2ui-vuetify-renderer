import { DataModel } from '@a2ui/web_core/v0_9';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import { A2UI_CONTEXT_KEY } from '../composables/useA2UI';
import A2UIAlert from './A2UIAlert.vue';
import A2UIBadge from './A2UIBadge.vue';
import A2UIBanner from './A2UIBanner.vue';
import A2UIEmptyState from './A2UIEmptyState.vue';
import A2UIRating from './A2UIRating.vue';

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
          catalog: { invoker: () => undefined },
        }),
      },
    },
    dataContextPath: '/',
  };
}

describe('Feedback Components', () => {
  describe('A2UIAlert', () => {
    it('renders alert', () => {
      const wrapper = mount(A2UIAlert, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: true },
        },
        props: {
          node: {
            id: 'alert1',
            type: 'Alert',
            properties: { title: 'Warning', text: 'Be careful' },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const alert = wrapper.findComponent({ name: 'VAlert' });
      expect(alert.exists()).toBe(true);
      expect(alert.props('title')).toBe('Warning');
      expect(alert.props('text')).toBe('Be careful');
    });
  });

  describe('A2UIBadge', () => {
    it('renders badge with child', () => {
      const wrapper = mount(A2UIBadge, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
          stubs: { ComponentNode: { template: '<div class="child">Child</div>' } },
        },
        props: {
          node: {
            id: 'badge1',
            type: 'Badge',
            properties: { content: '5', child: 'icon1' },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const badge = wrapper.findComponent({ name: 'VBadge' });
      expect(badge.exists()).toBe(true);
      expect(badge.props('content')).toBe('5');
    });
  });

  describe('A2UIBanner', () => {
    it('renders banner', () => {
      const wrapper = mount(A2UIBanner, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
        },
        props: {
          node: {
            id: 'ban1',
            type: 'Banner',
            properties: { text: 'New update available' },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const banner = wrapper.findComponent({ name: 'VBanner' });
      expect(banner.exists()).toBe(true);
      expect(banner.props('text')).toBe('New update available');
    });
  });

  describe('A2UIRating', () => {
    it('renders rating', () => {
      const wrapper = mount(A2UIRating, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
        },
        props: {
          node: {
            id: 'rating1',
            type: 'Rating',
            properties: { value: 3, max: 5 },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const rating = wrapper.findComponent({ name: 'VRating' });
      expect(rating.exists()).toBe(true);
      expect(rating.props('modelValue')).toBe(3);
    });

    it('binds rating value', async () => {
      const mockContext = createMockContext({ user: { rating: 4 } });
      const wrapper = mount(A2UIRating, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify],
        },
        props: {
          node: {
            id: 'rating2',
            type: 'Rating',
            properties: { value: { path: '/user/rating' } },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const rating = wrapper.findComponent({ name: 'VRating' });
      expect(rating.props('modelValue')).toBe(4);

      await rating.vm.$emit('update:modelValue', 5);
      expect(mockContext.processor.model.getSurface().dataModel.get('/user/rating')).toBe(5);
    });
  });

  describe('A2UIEmptyState', () => {
    it('renders empty state', () => {
      const wrapper = mount(A2UIEmptyState, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify],
        },
        props: {
          node: {
            id: 'es1',
            type: 'EmptyState',
            properties: { title: 'No Data', text: 'Please add something' },
            onUpdated: { subscribe: vi.fn() },
          } as any,
        },
      });
      const es = wrapper.findComponent({ name: 'VEmptyState' });
      expect(es.exists()).toBe(true);
      expect(es.props('title')).toBe('No Data');
      expect(es.props('text')).toBe('Please add something');
    });
  });
});
