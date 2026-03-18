import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UITextField from './A2UITextField.vue';
import A2UITextArea from './A2UITextArea.vue';
import A2UINumberInput from './A2UINumberInput.vue';
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

describe('Form Inputs', () => {
  describe('A2UITextField', () => {
    it('renders text field with label', () => {
      const wrapper = mount(A2UITextField, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'tf1', type: 'TextField', properties: { label: 'Username' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const tf = wrapper.findComponent({ name: 'VTextField' });
      expect(tf.exists()).toBe(true);
      expect(tf.props('label')).toBe('Username');
    });

    it('binds value correctly', async () => {
      const mockContext = createMockContext({ user: { name: 'John' } });
      const wrapper = mount(A2UITextField, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'tf2', type: 'TextField', properties: { value: { path: '/user/name' } }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const tf = wrapper.findComponent({ name: 'VTextField' });
      expect(tf.props('modelValue')).toBe('John');

      // Update value
      await tf.vm.$emit('update:modelValue', 'Jane');
      expect(mockContext.processor.model.getSurface().dataModel.get('/user/name')).toBe('Jane');
    });

    it('applies validation rules', () => {
      const wrapper = mount(A2UITextField, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'tf3', type: 'TextField', properties: { checks: [{ type: 'required', message: 'Needed' }] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const tf = wrapper.findComponent({ name: 'VTextField' });
      const rules = tf.props('rules') as any[];
      expect(rules.length).toBe(1);
      expect(rules[0]('')).toBe('Needed');
    });
  });

  describe('A2UITextArea', () => {
    it('renders textarea with label', () => {
      const wrapper = mount(A2UITextArea, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'ta1', type: 'TextArea', properties: { label: 'Comments' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const ta = wrapper.findComponent({ name: 'VTextarea' });
      expect(ta.exists()).toBe(true);
      expect(ta.props('label')).toBe('Comments');
    });

    it('binds value correctly', async () => {
      const mockContext = createMockContext({ user: { comments: 'Hello' } });
      const wrapper = mount(A2UITextArea, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'ta2', type: 'TextArea', properties: { value: { path: '/user/comments' } }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const ta = wrapper.findComponent({ name: 'VTextarea' });
      expect(ta.props('modelValue')).toBe('Hello');

      await ta.vm.$emit('update:modelValue', 'World');
      expect(mockContext.processor.model.getSurface().dataModel.get('/user/comments')).toBe('World');
    });
  });

  describe('A2UINumberInput', () => {
    it('renders number input with label', () => {
      const wrapper = mount(A2UINumberInput, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'ni1', type: 'NumberInput', properties: { label: 'Age' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const tf = wrapper.findComponent({ name: 'VTextField' });
      expect(tf.exists()).toBe(true);
      expect(tf.props('label')).toBe('Age');
      expect(tf.props('type')).toBe('number');
    });

    it('binds value correctly', async () => {
      const mockContext = createMockContext({ user: { age: 30 } });
      const wrapper = mount(A2UINumberInput, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'ni2', type: 'NumberInput', properties: { value: { path: '/user/age' } }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const tf = wrapper.findComponent({ name: 'VTextField' });
      expect(tf.props('modelValue')).toBe(30);

      // In v-text-field type number, events might emit string
      await tf.vm.$emit('update:modelValue', '31');
      expect(mockContext.processor.model.getSurface().dataModel.get('/user/age')).toBe(31);
    });
  });
});
