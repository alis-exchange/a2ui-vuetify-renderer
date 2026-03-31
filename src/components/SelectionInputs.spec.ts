import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import A2UICheckbox from './A2UICheckbox.vue';
import A2UIRadioButton from './A2UIRadioButton.vue';
import A2UISelect from './A2UISelect.vue';
import A2UIAutocomplete from './A2UIAutocomplete.vue';
import A2UICombobox from './A2UICombobox.vue';
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

describe('Selection Inputs', () => {
  describe('A2UICheckbox', () => {
    it('renders checkbox with label', () => {
      const wrapper = mount(A2UICheckbox, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'cb1', type: 'Checkbox', properties: { label: 'Accept Terms' }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const cb = wrapper.findComponent({ name: 'VCheckbox' });
      expect(cb.exists()).toBe(true);
      expect(cb.props('label')).toBe('Accept Terms');
    });

    it('binds boolean value', async () => {
      const mockContext = createMockContext({ user: { accepted: true } });
      const wrapper = mount(A2UICheckbox, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'cb2', type: 'Checkbox', properties: { value: { path: '/user/accepted' } }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const cb = wrapper.findComponent({ name: 'VCheckbox' });
      expect(cb.props('modelValue')).toBe(true);

      await cb.vm.$emit('update:modelValue', false);
      expect(mockContext.processor.model.getSurface().dataModel.get('/user/accepted')).toBe(false);
    });

    it('applies validation rules', () => {
      const wrapper = mount(A2UICheckbox, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'cb3', type: 'Checkbox', properties: { checks: ['required'] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const cb = wrapper.findComponent({ name: 'VCheckbox' });
      const rules = cb.props('rules') as any[];
      expect(rules.length).toBe(1);
    });

    it('dispatches action on toggle when action is defined', async () => {
      const mockContext = createMockContext({ user: { accepted: false } });
      const wrapper = mount(A2UICheckbox, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'cb-action', type: 'Checkbox',
            properties: {
              value: { path: '/user/accepted' },
              action: { event: { name: 'toggled' } }
            }
          } as any
        }
      });
      const cb = wrapper.findComponent({ name: 'VCheckbox' });
      await cb.vm.$emit('update:modelValue', true);
      expect(mockContext.onAction).toHaveBeenCalledWith(expect.objectContaining({
        name: 'toggled',
        sourceComponentId: 'cb-action',
        surfaceId: 'test-surface',
        timestamp: expect.any(String),
        context: expect.objectContaining({ value: true })
      }));
    });
  });

  describe('A2UIRadioButton', () => {
    it('renders radio group', () => {
      const wrapper = mount(A2UIRadioButton, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'rb1', type: 'RadioButton', properties: { options: ['Red', 'Blue'] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const rg = wrapper.findComponent({ name: 'VRadioGroup' });
      expect(rg.exists()).toBe(true);
      const radios = wrapper.findAllComponents({ name: 'VRadio' });
      expect(radios.length).toBe(2);
      expect(radios[0].props('label')).toBe('Red');
    });

    it('binds string value', async () => {
      const mockContext = createMockContext({ user: { color: 'Blue' } });
      const wrapper = mount(A2UIRadioButton, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'rb2', type: 'RadioButton', properties: { options: ['Red', 'Blue'], value: { path: '/user/color' } }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const rg = wrapper.findComponent({ name: 'VRadioGroup' });
      expect(rg.props('modelValue')).toBe('Blue');

      await rg.vm.$emit('update:modelValue', 'Red');
      expect(mockContext.processor.model.getSurface().dataModel.get('/user/color')).toBe('Red');
    });
  });

  describe('A2UISelect', () => {
    it('renders select with options', () => {
      const wrapper = mount(A2UISelect, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'sel1', type: 'Select', properties: { options: ['Apple', 'Banana'] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const sel = wrapper.findComponent({ name: 'VSelect' });
      expect(sel.exists()).toBe(true);
      expect(sel.props('items')).toEqual(['Apple', 'Banana']);
    });

    it('binds selection', async () => {
      const mockContext = createMockContext({ user: { fruit: 'Apple' } });
      const wrapper = mount(A2UISelect, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'sel2', type: 'Select', properties: { value: { path: '/user/fruit' } }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const sel = wrapper.findComponent({ name: 'VSelect' });
      expect(sel.props('modelValue')).toBe('Apple');

      await sel.vm.$emit('update:modelValue', 'Banana');
      expect(mockContext.processor.model.getSurface().dataModel.get('/user/fruit')).toBe('Banana');
    });

    it('dispatches action on selection change when action is defined', async () => {
      const mockContext = createMockContext({ user: { fruit: 'Apple' } });
      const wrapper = mount(A2UISelect, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: mockContext },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'sel-action', type: 'Select',
            properties: {
              options: ['Apple', 'Banana'],
              value: { path: '/user/fruit' },
              action: { event: { name: 'fruit-selected' } }
            }
          } as any
        }
      });
      const sel = wrapper.findComponent({ name: 'VSelect' });
      await sel.vm.$emit('update:modelValue', 'Banana');
      expect(mockContext.onAction).toHaveBeenCalledWith(expect.objectContaining({
        name: 'fruit-selected',
        sourceComponentId: 'sel-action',
        surfaceId: 'test-surface',
        timestamp: expect.any(String),
        context: expect.objectContaining({ value: 'Banana' })
      }));
    });
  });

  describe('A2UIAutocomplete', () => {
    it('renders autocomplete', () => {
      const wrapper = mount(A2UIAutocomplete, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'ac1', type: 'Autocomplete', properties: { options: ['Car', 'Bike'] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const ac = wrapper.findComponent({ name: 'VAutocomplete' });
      expect(ac.exists()).toBe(true);
      expect(ac.props('items')).toEqual(['Car', 'Bike']);
    });
  });

  describe('A2UICombobox', () => {
    it('renders combobox', () => {
      const wrapper = mount(A2UICombobox, {
        global: {
          provide: { [A2UI_CONTEXT_KEY as symbol]: createMockContext() },
          plugins: [vuetify]
        },
        props: {
          node: {
            id: 'cbx1', type: 'Combobox', properties: { options: ['Dog', 'Cat'] }, onUpdated: { subscribe: vi.fn() }
          } as any
        }
      });
      const cbx = wrapper.findComponent({ name: 'VCombobox' });
      expect(cbx.exists()).toBe(true);
      expect(cbx.props('items')).toEqual(['Dog', 'Cat']);
    });
  });
});
