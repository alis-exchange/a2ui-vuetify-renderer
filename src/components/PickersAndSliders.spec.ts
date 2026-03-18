import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UISlider from './A2UISlider.vue';
import A2UIRangeSlider from './A2UIRangeSlider.vue';
import A2UIDatePicker from './A2UIDatePicker.vue';
import A2UITimePicker from './A2UITimePicker.vue';
import A2UIFileInput from './A2UIFileInput.vue';
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
          dataModel: dataModel
        })
      }
    },
    dataContextPath: '/'
  };
}

describe('Pickers and Sliders', () => {
  describe('A2UISlider', () => {
    it('renders slider', () => {
      const wrapper = mount(A2UISlider, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'sl1', type: 'Slider', properties: { min: 0, max: 100 }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const sl = wrapper.findComponent({ name: 'VSlider' });
      expect(sl.exists()).toBe(true);
      expect(sl.props('min')).toBe(0);
      expect(sl.props('max')).toBe(100);
    });
  });

  describe('A2UIRangeSlider', () => {
    it('renders range slider', () => {
      const wrapper = mount(A2UIRangeSlider, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'rsl1', type: 'RangeSlider', properties: { min: 10, max: 50 }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const rsl = wrapper.findComponent({ name: 'VRangeSlider' });
      expect(rsl.exists()).toBe(true);
      expect(rsl.props('min')).toBe(10);
    });
  });

  describe('A2UIDatePicker', () => {
    it('renders date picker', () => {
      const wrapper = mount(A2UIDatePicker, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'dp1', type: 'DatePicker', properties: { label: 'Date' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const dp = wrapper.findComponent({ name: 'VDatePicker' });
      expect(dp.exists()).toBe(true);
    });
  });

  describe('A2UITimePicker', () => {
    it('renders time picker', () => {
      const wrapper = mount(A2UITimePicker, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'tp1', type: 'TimePicker', properties: { label: 'Time' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      // Vuetify v-time-picker may require labs or a different component
      // We will assume 'VTextField' for time input or 'VTimePicker' if available
      const tp = wrapper.findComponent({ name: 'VTimePicker' });
      if (!tp.exists()) {
         const alt = wrapper.find('input[type="time"]');
         expect(alt.exists()).toBe(true);
      } else {
         expect(tp.exists()).toBe(true);
      }
    });
  });

  describe('A2UIFileInput', () => {
    it('renders file input', () => {
      const wrapper = mount(A2UIFileInput, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'fi1', type: 'FileInput', properties: { label: 'Upload' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const fi = wrapper.findComponent({ name: 'VFileInput' });
      expect(fi.exists()).toBe(true);
      expect(fi.props('label')).toBe('Upload');
    });
  });
});
